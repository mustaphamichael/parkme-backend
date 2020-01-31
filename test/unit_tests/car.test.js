const supertest = require('supertest'),
    app = require('../../app'),
    request = supertest(app),
    mockDb = require('../mockdb'),
    { Car, Driver } = require('../../src/models');
const endPoint = '/api/parkme/cars'

mockDb.run() // Run mockdb in lifecycle

beforeEach(async () => {
    // Seed db
    await Driver.create({
        name: "Driver",
        phone: "2348091234567",
        dateCreated: "2020-01-25T03:42:19.150Z",
        car: []
    })

    await Car.create({
        numberPlate: "NUM-PLATE",
        manufacturer: "Ford",
        model: "model",
        driver: "5e308844af990971d306c40f"
    })
})

describe('/POST Car tests', () => {
    // express-validator check errors
    const errors = [`Driver is required`, `Number plate is required`, 'Manufacturer is required', 'Model is required']

    it('should check for body errors', async () => {
        const response = await request.post(endPoint)
        expect(response.status).toBe(422)
        expect(response.body.errors).toEqual(errors)
    })

    it('should create a car', async () => {
        const response = await request.post(endPoint)
            .send({ phone: '2348091234567', numberPlate: "NUM-P", manufacturer: "Toyota", model: "Corolla" })
        expect(response.status).toBe(201)
    })
})

describe('/GET Car tests', () => {
    it('should return count of cars', async () => {
        const response = await request.get(`${endPoint}/system/count`)
        expect(response.body.data).toEqual(1)
    })
})

describe('/PATCH Car', () => {
    it('should return 404 error', async () => {
        const response = await request.patch(`${endPoint}/`, {})
        expect(response.status).toBe(404)
        expect(response.body.message).toEqual('Not Found')
    })
})