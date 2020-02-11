const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Driver = require('./driver')

const CarSchema = new Schema({
    numberPlate: { type: String, required: [true, 'Provide a number plate'] },
    manufacturer: String,
    model: String,
    driver: { type: Schema.Types.ObjectId, ref: 'Driver' }
})

// Update driver cars array
CarSchema.post("save", (doc) => {
    Driver.updateOne({ "_id": doc.driver },
        { $push: { cars: doc._id } }) // Push cars to drivers
        .then(console.log('Updated driver', doc.driver.name))
        .catch(e => console.log("CAR_MIDWARE_ERR ::", e))
})

// Remove car from driver
CarSchema.post("findOneAndRemove", (doc) => {
    Driver.updateOne({ "_id": doc.driver },
        { $pull: { cars: { $in: [doc._id] } } })
        .then(console.log("Deleted car"))
        .catch(e => console.log("DB_ERROR ::", e))

})
module.exports = mongoose.model('Car', CarSchema)