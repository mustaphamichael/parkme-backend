const supertest = require('supertest'),
    app = require('../../app'),
    request = supertest(app),
    mockDb = require('../mockdb'),
    { Hub, Slot } = require('../../src/models');
const endPoint = '/api/parkme/hubs'

mockDb.run() // Run mockdb in lifecycle

beforeEach(async () => {
    // Seed db
    await Hub.create({ _id: '5e308844af990971d306c40f', tag: "A", slots: [] })
    await Slot.create({ tag: "1", status: 1, hub: '5e308844af990971d306c40f' })
})

describe('/POST Hub tests', () => {
    // express-validator check errors
    const errors = [`A tag is required`]

    it('should check for body errors', async () => {
        const response = await request.post(endPoint)
        expect(response.status).toBe(422)
        expect(response.body.errors).toEqual(errors)
    })

    it('should create a hub', async () => {
        const response = await request.post(endPoint).send({ tag: 'Hub360' })
        expect(response.status).toBe(201)
    })
})

describe('/GET Hub tests', () => {
    it('should return list of hubs', async () => {
        const response = await request.get(endPoint)
        expect(response.body.data.length).toBe(1)
    })

    it('should get a hub detail', async () => {
        const response = await request.get(`${endPoint}/A`)
        expect(response.status).toBe(200)
    })

    it('should return count of hubs', async () => {
        const response = await request.get(`${endPoint}/system/count`)
        expect(response.body.data).toEqual(1)
    })
})

describe('/POST Slot tests', () => {
    // express-validator check errors
    const errors = [`A tag is required`]

    it('should check for body errors', async () => {
        const response = await request.post(`${endPoint}/A/slots`)
        expect(response.status).toBe(422)
        expect(response.body.errors).toEqual(errors)
    })

    it('should create a slot and return default status as 0', async () => {
        const response = await request.post(`${endPoint}/A/slots`).send({ tag: 'Slotify' })
        expect(response.status).toBe(201)
        expect(response.body.data.status).toBe(0)
    })
})

describe('/GET Slot tests', () => {
    it('should get a slot detail', async () => {
        const response = await request.get(`${endPoint}/A/slots/1`)
        expect(response.status).toBe(200)
    })

    it('should return a 404 error (Hub not found)', async () => {
        const response = await request.get(`${endPoint}/A/slots/`)
        expect(response.status).toBe(404)
    })

    it('should return a 404 error (Hub not found)', async () => {
        const response = await request.get(`${endPoint}/B/slots/1`)
        expect(response.status).toBe(404)
        expect(response.body.message).toEqual('This hub does not exist')
    })

    it('should return a 404 error (Slot not found)', async () => {
        const response = await request.get(`${endPoint}/A/slots/2`)
        expect(response.status).toBe(404)
        expect(response.body.message).toEqual('Slot does not exist')
    })
})

describe('/PATCH Slot tests', () => {
    it('should return driver not found error', async () => {
        const response = await request.patch(`${endPoint}/A/slots/1`, {})
        expect(response.status).toBe(200)
    })

    it('should return a 404 error (Hub not found)', async () => {
        const response = await request.patch(`${endPoint}/B/slots/1`)
        expect(response.status).toBe(404)
        expect(response.body.message).toEqual('This hub does not exist')
    })

    it('should return a 404 error (Slot not found)', async () => {
        const response = await request.patch(`${endPoint}/A/slots/2`)
        expect(response.status).toBe(404)
        expect(response.body.message).toEqual('Slot not found')
    })
})

describe('/DELETE Slot tests', () => {
    it('should return driver not found error', async () => {
        const response = await request.delete(`${endPoint}/A/slots/1`, {})
        expect(response.status).toBe(200)
    })

    it('should return a 404 error (Hub not found)', async () => {
        const response = await request.delete(`${endPoint}/B/slots/1`)
        expect(response.status).toBe(404)
        expect(response.body.message).toEqual('This hub does not exist')
    })

    it('should return a 404 error (Slot not found)', async () => {
        const response = await request.delete(`${endPoint}/A/slots/2`)
        expect(response.status).toBe(404)
        expect(response.body.message).toEqual('Slot not found')
    })
})
