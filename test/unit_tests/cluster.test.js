const supertest = require("supertest"),
    app = require("../../app"),
    request = supertest(app),
    mockDb = require("../mockdb"),
    { Cluster, Terminal } = require("../../src/models");
const endPoint = "/api/parkme/clusters"

mockDb.run() // Run mockdb in lifecycle

beforeEach(async () => {
    // Seed db
    await Cluster.create({ _id: "5e308844af990971d306c41e", tag: "1" })
    await Terminal.create({ _id: "5e308844af990971d306c40f", name: "MyHub", cluster: "5e308844af990971d306c41e" })
})

describe("/POST Clusters tests", () => {
    // express-validator check errors
    const errors = ["Cluster tag is required"]

    it("should check for body errors", async () => {
        const response = await request.post(endPoint)
        expect(response.status).toBe(422)
        expect(response.body.errors).toEqual(errors)
    })

    it("should create a cluster", async () => {
        const response = await request.post(endPoint).send({ tag: "4" })
        expect(response.status).toBe(201)
    })
})

describe("/POST Terminal tests", () => {
    // express-validator check errors
    const errors = ["Cluster id is required", "Invalid Id", "Terminal name is required"]

    it("should check for body errors", async () => {
        const response = await request.post(`${endPoint}/terminals`)
        expect(response.status).toBe(422)
        expect(response.body.errors).toEqual(errors)
    })

    it("should return 'LANE NOT FOUND' for a wrong Cluster Id", async () => {
        const response = await request.post(`${endPoint}/terminals`)
            .send({ name: "BukkaHut", cluster: "5e308844af990971d306c41f" })
        expect(response.status).toBe(404)
        expect(response.body.message).toEqual("Cluster does not exist")
    })

    it("should create a terminal", async () => {
        const response = await request.post(`${endPoint}/terminals`)
            .send({ name: "BukkaHut", cluster: "5e308844af990971d306c41e" })
        expect(response.status).toBe(201)
    })
})

describe("/GET Terminal tests", () => {
    it("should return count of terminals", async () => {
        const response = await request.get(`${endPoint}/terminals/count`)
        expect(response.body.data).toEqual(1)
    })
})

describe("/PATCH Cluster tests", () => {
    it("should return 404 error", async () => {
        const response = await request.patch(`${endPoint}/`, {})
        expect(response.status).toBe(404)
        expect(response.body.message).toEqual("Not Found")
    })

    it("should edit cluster successfully", async () => {
        const response = await request.patch(`${endPoint}/5e308844af990971d306c41e`, {})
        console.log(response.body)
        expect(response.status).toBe(200)
        expect(response.body.message).toEqual("Edit cluster successfully")
    })
})

describe("/PATCH Terminal tests", () => {
    it("should edit terminal successfully", async () => {
        const response = await request.patch(`${endPoint}/terminals/5e308844af990971d306c40f`, {})
        expect(response.status).toBe(200)
        expect(response.body.message).toEqual("Edit terminal successfully")
    })
})

// describe("/DELETE Terminal tests", () => {
//     it("should return success", async () => {
//         const response = await request.delete(`${endPoint}/5e308844af990971d306c40f`, {})
//         expect(response.status).toBe(200)
//     })
// })