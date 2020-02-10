const supertest = require("supertest"),
    app = require("../../app"),
    request = supertest(app),
    mockDb = require("../mockdb"),
    { Distance, Hub, Terminal } = require("../../src/models");
const endPoint = "/api/parkme/distances"

mockDb.run() // Run mockdb in lifecycle

beforeEach(async () => {
    // Seed db
    await Terminal.create({ _id: "6e308844af990971d306c41f", name: "D1" })
    await Hub.create({ _id: "5e308844af990971d306c40f", tag: "A", slots: [] })
    await Distance.create({ _id: "7e308844af990971d306c40f", hub: "5e308844af990971d306c40f", terminal: "6e308844af990971d306c41f" })
})

describe("/POST Distance tests", () => {
    it("should return error for invalid IDs", async () => {
        const response = await request.post(endPoint)
            .send({ terminal: "BukkaHut", hub: "HUBID", distance: 42.90 })
        expect(response.status).toBe(422)
    })

    it("should avoid duplicate distnaces", async () => {
        const response = await request.post(endPoint)
            .send({ terminal: "6e308844af990971d306c41f", hub: "5e308844af990971d306c40f", distance: 42.90 })
        expect(response.body.message).toEqual("Distance already exists")
    })
})

describe("/PATCH Distance tests", () => {
    it("should return 404 error", async () => {
        const response = await request.patch(`${endPoint}/`, {})
        expect(response.status).toBe(404)
        expect(response.body.message).toEqual("Not Found")
    })

    it("should return 404 error", async () => {
        const response = await request.patch(`${endPoint}/7e308844af990971d306c40f`).send({ distance: 100.0 })
        expect(response.status).toBe(200)
        expect(response.body.message).toEqual("Edit distance successfully")
        expect(response.body.data.distance).toBe(100.0)
    })
})

describe("/DELETE Distance tests", () => {
    it("should return success", async () => {
        const response = await request.delete(`${endPoint}/7e308844af990971d306c40f`)
        expect(response.status).toBe(200)
    })
})