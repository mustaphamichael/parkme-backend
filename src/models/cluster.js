const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    uniqueValidator = require('mongoose-unique-validator')

const ClusterSchema = new Schema({
    tag: { type: String, unique: true, index: true, required: [true, 'Provide a tag'] },
    terminals: [{ type: Schema.Types.ObjectId, ref: 'Terminal' }],
    distances: [{ type: Schema.Types.ObjectId, ref: 'Distance' }]
})
ClusterSchema.plugin(uniqueValidator, { message: 'This cluster already exists' });
module.exports = mongoose.model('Cluster', ClusterSchema)