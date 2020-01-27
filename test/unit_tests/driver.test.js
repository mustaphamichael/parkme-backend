const supertest = require('supertest'),
    app = require('../../app'),
    request = supertest(app),
    mockDb = require('../mockdb'),
    { Driver } = require('../../src/models');
const endPoint = '/api/parkme/drivers'

mockDb.run() // Run mockdb in lifecycle

beforeEach(async () => {
    // Seed db
    await Driver.create({
        name: "Driver",
        phone: "2348091234567",
        dateCreated: "2020-01-25T03:42:19.150Z",
        car: []
    })
})

describe('/POST Driver tests', () => {
    // express-validator check errors
    const errors = [`Driver's name is required`, `Driver's phone is required`, 'A car must be added', 'Add a number plate to the car']

    it('should check for body errors', async () => {
        const response = await request.post(endPoint)
        expect(response.status).toBe(422)
        // expect(response.body.errors).toEqual(expect.arrayContaining(errors))
        expect(response.body.errors).toEqual(errors)
    })

    it('should return error if CAR is not added', async () => {
        const response = await request.post(endPoint).send({ name: 'D2', phone: '2335' })
        expect(response.status).toBe(422)
        expect(response.body.errors[0]).toEqual('A car must be added')
    })

    it('should return error if Number Plate is not added to a car object', async () => {
        const response = await request.post(endPoint).send({ name: 'D2', phone: '2335', car: {} })
        expect(response.status).toBe(422)
        expect(response.body.errors[0]).toEqual('Add a number plate to the car')
    })

    it('should create a driver', async () => {
        const response = await request.post(endPoint).send({ name: 'D2', phone: '2335', car: { numberPlate: 'NUM-PLATE' } })
        expect(response.status).toBe(201)
    })
})

describe('/GET Driver tests', () => {
    it('should return list of drivers', async () => {
        const response = await request.get(endPoint)
        expect(response.body.data.length).toBe(1)
    })

    it('should get a driver detail', async () => {
        const response = await request.get(`${endPoint}/2348091234567`)
        expect(response.status).toBe(200)
    })

    it('should return count of drivers', async () => {
        const response = await request.get(`${endPoint}/system/count`)
        expect(response.body.data).toEqual(1)
    })
})

describe('/PATCH Driver', () => {
    it('should return 404 error', async () => {
        const response = await request.patch(`${endPoint}/`, {})
        expect(response.status).toBe(404)
        expect(response.body.message).toEqual('Not Found')
    })

    it('should return driver not found error', async () => {
        const response = await request.patch(`${endPoint}/234`, {})
        expect(response.status).toBe(404)
        expect(response.body.message).toEqual('Driver not found')
    })
})
