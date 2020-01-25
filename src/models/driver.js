const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    uniqueValidator = require('mongoose-unique-validator')

const DriverSchema = new Schema({
    phone: { type: String, unique: true, index: true, required: [true, 'Provide a phone number'] },
    name: String,
    cars: [{ type: Schema.Types.ObjectId, ref: 'Car' }],
    dateCreated: { type: Date, default: Date.now() }
})

DriverSchema.plugin(uniqueValidator, {
    message: 'This driver already exists'
});

module.exports = mongoose.model('Driver', DriverSchema)