const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    uniqueValidator = require('mongoose-unique-validator')

const HubSchema = new Schema({
    tag: { type: String, unique: true, index: true, required: [true, 'Provide a tag'] },
    slots: [{ type: Schema.Types.ObjectId, ref: 'Slot' }]
})
HubSchema.plugin(uniqueValidator, { message: 'This hub already exists' });

module.exports = mongoose.model('Hub', HubSchema)