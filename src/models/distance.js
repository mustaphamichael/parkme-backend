const mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    Cluster = require("./cluster")

const DistanceSchema = new Schema({
    hub: { type: Schema.Types.ObjectId, ref: "Hub", required: [true, "A valid hub is required"] }, // Source point
    cluster: { type: Schema.Types.ObjectId, ref: "Cluster", required: [true, "A valid cluster is required"] },
    distance: Number
})

// Update the cluster distance
DistanceSchema.post("save", (doc) => {
    Cluster.updateOne({ "_id": doc.cluster },
        { $push: { distances: doc._id } }) // Push distance to cluster
        .then(console.log("Updated cluster", doc.cluster.tag))
        .catch(e => console.log("DB_ERROR ::", e))
})

// Remove distance from cluster
DistanceSchema.post("findOneAndRemove", async (doc) => {
    Cluster.updateOne({ "_id": doc.cluster },
        { $pull: { distances: { $in: [doc._id] } } })
        .then(console.log("Deleted distance"))
        .catch(e => console.log("DB_ERROR ::", e))
})
module.exports = mongoose.model("Distance", DistanceSchema)