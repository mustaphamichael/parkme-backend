const supertest = require("supertest"),
    app = require("../../app"),
    request = supertest(app),
    mockDb = require("../mockdb"),
    { Terminal } = require("../../src/models");
const endPoint = "/api/parkme/terminals"

mockDb.run() // Run mockdb in lifecycle

beforeEach(async () => {
    // Seed db
    await Terminal.create({ _id: "5e308844af990971d306c40f", name: "D1" })
})

describe("/POST Terminal tests", () => {
    // express-validator check errors
    const errors = ["Terminal name is required"]

    it("should check for body errors", async () => {
        const response = await request.post(endPoint)
        expect(response.status).toBe(422)
        expect(response.body.errors).toEqual(errors)
    })

    it("should create a terminal", async () => {
        const response = await request.post(endPoint).send({ name: "BukkaHut" })
        expect(response.status).toBe(201)
    })
})

describe("/GET Terminal tests", () => {
    it("should return count of terminals", async () => {
        const response = await request.get(`${endPoint}/system/count`)
        expect(response.body.data).toEqual(1)
    })
})

describe("/PATCH Terminal tests", () => {
    it("should return 404 error", async () => {
        const response = await request.patch(`${endPoint}/`, {})
        expect(response.status).toBe(404)
        expect(response.body.message).toEqual("Not Found")
    })

    it("should return 404 error", async () => {
        const response = await request.patch(`${endPoint}/5e308844af990971d306c40f`, {})
        expect(response.status).toBe(200)
        expect(response.body.message).toEqual("Edit terminal successfully")
    })
})

describe("/DELETE Terminal tests", () => {
    it("should return success", async () => {
        const response = await request.delete(`${endPoint}/5e308844af990971d306c40f`, {})
        expect(response.status).toBe(200)
    })
})