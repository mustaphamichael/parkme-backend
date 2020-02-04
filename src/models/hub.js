const mongoose = require('mongoose'),
    Schema = mongoose.Schema

const HubSchema = new Schema({
    tag: String,
    slots: [{ type: Schema.Types.ObjectId, ref: 'Slot' }]
})

module.exports = mongoose.model('Hub', HubSchema)