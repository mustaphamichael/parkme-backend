const mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    Terminal = require("./terminal")

const DistanceSchema = new Schema({
    hub: { type: Schema.Types.ObjectId, ref: "Hub", required: [true, "A valid hub is required"] }, // Source point
    terminal: { type: Schema.Types.ObjectId, ref: "Terminal", required: [true, "A valid terminal is required"] },
    distance: Number
})

// Update the terminal distance
DistanceSchema.post("save", (doc) => {
    Terminal.updateOne({ "_id": doc.terminal },
        { $push: { distances: doc._id } }) // Push distance to terminal
        .then(console.log("Updated terminal", doc.terminal.name))
        .catch(e => console.log("DB_ERROR ::", e))
})

// Remove distance from terminal
DistanceSchema.post("findOneAndRemove", async (doc) => {
    Terminal.updateOne({ "_id": doc.terminal },
        { $pull: { distances: { $in: [doc._id] } } })
        .then(console.log("Deleted distance"))
        .catch(e => console.log("DB_ERROR ::", e))
})
module.exports = mongoose.model("Distance", DistanceSchema)