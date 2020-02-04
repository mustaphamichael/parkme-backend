const mongoose = require('mongoose'),
    Schema = mongoose.Schema

const SlotSchema = new Schema({
    tag: String,
    status: { type: Number, enum: [0, 1, 2], default: 0 },
    hub: { type: Schema.Types.ObjectId, ref: 'Hub' }
})

module.exports = mongoose.model('Slot', SlotSchema)