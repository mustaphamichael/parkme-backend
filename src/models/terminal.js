const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    uniqueValidator = require('mongoose-unique-validator'),
    Cluster = require("./cluster")

const TerminalSchema = new Schema({
    name: { type: String, unique: true, index: true, required: [true, 'Provide a name'] },
    logo_url: String,
    cluster: { type: Schema.Types.ObjectId, ref: 'Cluster', required: [true, "A terminal must have a cluster"] }
})
TerminalSchema.plugin(uniqueValidator, { message: 'This terminal already exists' });

// Update cluster terminals array
TerminalSchema.post("save", (doc) => {
    Cluster.updateOne({ "_id": doc.cluster },
        { $push: { terminals: doc._id } }) // Push terminals to cluster
        .then(console.log('Updated cluster', doc.cluster.tag))
        .catch(e => console.log("TERMINAL_MIDWARE_ERR ::", e))
})

// Remove terminal from cluster
TerminalSchema.post("findOneAndRemove", (doc) => {
    Cluster.updateOne({ "_id": doc.cluster },
        { $pull: { terminals: { $in: [doc._id] } } })
        .then(console.log("Deleted terminal"))
        .catch(e => console.log("DB_ERROR ::", e))

})
module.exports = mongoose.model('Terminal', TerminalSchema)