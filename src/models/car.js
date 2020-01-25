const mongoose = require('mongoose'),
    Schema = mongoose.Schema

const CarSchema = new Schema({
    numberPlate: { type: String, required: [true, 'Provide a number plate'] },
    manufacturer: String,
    model: String,
    driver: { type: Schema.Types.ObjectId, ref: 'Driver' }
})

module.exports = mongoose.model('Car', CarSchema)