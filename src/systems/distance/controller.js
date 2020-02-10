const { check, validationResult } = require("express-validator"),
    { Distance } = require("../../models"),
    { error, success } = require("../../utils/response")

module.exports.create = async (req, res) => {
    await check("terminal", "Terminal id is required").not().isEmpty().isMongoId().withMessage("Must be a valid Id").run(req)
    await check("hub", "Hub id is required").not().isEmpty().isMongoId().withMessage("Must be a valid Id").run(req)
    await check("distance", "Distance is required").not().isEmpty().run(req)
    await check("distance", "Distance must be greater than 0.0").isFloat({ gt: 0.0 }).run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error("Unprocessed Entity", errors.array().map(i => i["msg"])))

    // Add check for duplicate values
    const val = await Distance.findOne({ $and: [{ "terminal": req.body.terminal }, { "hub": req.body.hub }] })
    if (val) return res.send(success("Distance already exists"))

    const distance = await Distance.create(req.body).catch(err => { return res.status(500).send(error(err.message)) })
    res.status(201).send(success("Added distance successful", distance))
}

module.exports.edit = async (req, res) => {
    await check("id", "Distance id is required").not().isEmpty().run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error("Unprocessed Entity", errors.array().map(i => i["msg"])))

    // Ensure terminal and hub are uneditable
    delete req.body.terminal
    delete req.body.hub

    const distance = await Distance.findOneAndUpdate({ "_id": req.params.id }, req.body, { new: true })
        .catch(err => { return res.status(500).send(error(err.message)) });
    (distance) ? res.send(success("Edit distance successfully", distance)) : res.status(404).send(error("Distance not found"))
}

module.exports.delete = async (req, res) => {
    await check('id', 'Distance id is required').not().isEmpty().run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error('Unprocessed Entity', errors.array().map(i => i['msg'])))

    const cDelete = await Distance.findOneAndRemove({ "_id": req.params.id }).catch(err => { return res.status(500).send(error(err.message)) });
    (cDelete) ? res.send(success('Delete distance successful')) : res.status(404).send(error('Distance not found'))
}