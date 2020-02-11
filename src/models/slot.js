const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Hub = require('./hub')

const SlotSchema = new Schema({
    tag: String,
    status: { type: Number, enum: [0, 1, 2], default: 0 },
    hub: { type: Schema.Types.ObjectId, ref: 'Hub', required: [true, "A slot must have a hub"] }
})

// Update hub slots array
SlotSchema.post("save", (doc) => {
    Hub.updateOne({ "_id": doc.hub },
        { $push: { slots: doc._id } }) // Push slots to hubs
        .then(console.log('Updated hub', doc.hub.tag))
        .catch(e => console.log("SLOT_MIDWARE_ERR ::", e))
})

// Remove slot from hub
SlotSchema.post("findOneAndRemove", (doc) => {
    Hub.updateOne({ "_id": doc.hub },
        { $pull: { slots: { $in: [doc._id] } } })
        .then(console.log("Deleted slot"))
        .catch(e => console.log("DB_ERROR ::", e))

})
module.exports = mongoose.model('Slot', SlotSchema)