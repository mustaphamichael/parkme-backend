const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    uniqueValidator = require('mongoose-unique-validator')

const TerminalSchema = new Schema({
    name: { type: String, unique: true, index: true, required: [true, 'Provide a name'] },
    logo_url: String,
    distances: [{ type: Schema.Types.ObjectId, ref: 'Distance' }]
})
TerminalSchema.plugin(uniqueValidator, { message: 'This terminal already exists' });
module.exports = mongoose.model('Terminal', TerminalSchema)