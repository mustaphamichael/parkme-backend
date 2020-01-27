const mongoose = require('mongoose')

module.exports.run = () => {

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
    })

    afterAll(async () => {
        await mongoose.connection.dropDatabase()
        await mongoose.connection.close()
    })

    afterEach(async () => {
        const collections = mongoose.connection.collections
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany();
        }
    })
}