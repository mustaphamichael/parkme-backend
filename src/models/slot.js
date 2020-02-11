const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Hub = require('./hub')

const SlotSchema = new Schema({
    tag: String,
    status: { type: Number, enum: [0, 1, 2], default: 0 },
    hub: { type: Schema.Types.ObjectId, ref: 'Hub', required: [true, "A slot must have a hub"] }
})

// Update hub slots array
SlotSchema.post("save", async (doc) => {
    await Hub.updateOne({ "_id": doc.hub },
        { $push: { distances: doc._id } }) // Push distance to terminal
        .catch(e => console.log("SLOT_MIDWARE_ERR ::", e))
    console.log('Updated hub', doc.hub.tag)
})

// Remove slot from hub
SlotSchema.post("findOneAndRemove", async (doc) => {
    await Hub.updateOne({ "_id": doc.hub },
        { $pull: { slots: { $in: [doc._id] } } })
        .catch(e => console.log("DB_ERROR ::", e))
    console.log("Deleted slot")
})
module.exports = mongoose.model('Slot', SlotSchema)