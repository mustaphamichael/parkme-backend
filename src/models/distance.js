const mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    Terminal = require("./terminal")

const DistanceSchema = new Schema({
    hub: { type: Schema.Types.ObjectId, ref: "Hub", required: [true, "A valid hub is required"] }, // Source point
    terminal: { type: Schema.Types.ObjectId, ref: "Terminal", required: [true, "A valid terminal is required"] },
    distance: Number
})

// Update the terminal distance
DistanceSchema.post("save", async (doc) => {
    const terminal = await Terminal.findOne(doc.terminal).catch(e => console.log("DB_ERROR ::", e))
    terminal.distances.push(doc._id)
    terminal.save()
    console.log("Updated terminal", terminal.name)
})

// Remove distance from terminal
DistanceSchema.post("findOneAndRemove", async (doc) => {
    await Terminal.update({ "_id": doc.terminal },
        { $pull: { distances: { $in: [doc._id] } } })
        .catch(e => console.log("DB_ERROR ::", e))
    console.log("Deleted distance")
})
module.exports = mongoose.model("Distance", DistanceSchema)