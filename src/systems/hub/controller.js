const { check, validationResult } = require('express-validator'),
    { Hub, Slot } = require('../../models'),
    { error, success } = require('../../utils/response')

/** Create a hub */
module.exports.createHub = async (req, res) => {
    await check('tag', `A tag is required`).not().isEmpty().run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error('Unprocessed Entity', errors.array().map(i => i['msg'])))

    const hub = await Hub.create(req.body).catch(err => { return res.status(500).send(error(err.message)) })
    res.status(201).send(success('Hub created successfully', hub))
}

/** Get all hubs */
module.exports.getHubs = async (req, res) => {
    const { limit, page } = req.query
    const hubs = await Hub.find()
        .limit(parseInt(limit) || 20)
        .skip(parseInt(page) > 0 ? ((parseInt(page) - 1) * parseInt(limit)) : 0)
        .catch(err => { return res.status(500).send(error(err.message)) })
    res.send(success('Retrieve hubs successful', hubs))
}

/** Get a single hub detail */
module.exports.getHub = async (req, res) => {
    await check('tag', `Hub's tag is required`).not().isEmpty().run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error('Unprocessed Entity', errors.array().map(i => i['msg'])))

    const hub = await Hub.findOne({ 'tag': req.params.tag }).populate('slots')
        .catch(err => { return res.status(500).send(error(err.message)) });
    (hub) ? res.send(success('Retrieve hub successfully', hub)) : res.status(404).send(error('Hub does not exist'))
}

module.exports.getHubCount = async (res) =>
    res.send(success('Total number of hubs', await Hub.estimatedDocumentCount()))

/** Create a slot */
module.exports.createSlot = async (req, res) => {
    await check('tag', `A tag is required`).not().isEmpty().run(req)
    await check('hubTag', `An assosciated hub tag is required`).not().isEmpty().run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error('Unprocessed Entity', errors.array().map(i => i['msg'])))

    const hub = await Hub.findOne({ tag: req.params.hubTag }).populate('slots')
        .catch(err => { return res.status(500).send(error(err.message)) })

    // Ensure the duplicate slots are not added
    const existingSlots = hub.slots.filter(c => c.tag === req.body.tag)
    if (existingSlots.length > 0) return res.status(409).send(error('A slot exists in this hub'))

    const slot = await Slot.create({ ...req.body, hub: hub._id })
        .catch(err => { return res.status(500).send(error(err.message)) }) // Create a slot assocaiated to a hub
    res.status(201).send(success('Slot created successfully', slot))
}

/** Get a slot detail */
module.exports.getSlot = async (req, res) => {
    await check('tag', `Slot's tag is required`).not().isEmpty().run(req)
    await check('hubTag', `An assosciated hub tag is required`).not().isEmpty().run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error('Unprocessed Entity', errors.array().map(i => i['msg'])))

    const hub = await Hub.findOne({ 'tag': req.params.hubTag }).populate('slots')
        .catch(err => { return res.status(500).send(error(err.message)) })

    if (hub) {
        // filter the slot
        const slot = await Slot.findOne({ $and: [{ 'tag': req.params.tag }, { 'hub': hub._id }] })
            .catch(err => { return res.status(500).send(error(err.message)) });
        return (slot) ? res.send(success('Retrieve slot successfully', slot)) : res.status(404).send(error('Slot does not exist'))
    }
    res.status(404).send(error('This hub does not exist'))
}

/** Edit a */
module.exports.editSlot = async (req, res) => {
    await check('tag', `Slot's tag is required`).not().isEmpty().run(req)
    await check('hubTag', `An assosciated hub tag is required`).not().isEmpty().run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error('Unprocessed Entity', errors.array().map(i => i['msg'])))

    const hub = await Hub.findOne({ 'tag': req.params.hubTag }).populate('slots')
        .catch(err => { return res.status(500).send(error(err.message)) })

    if (hub) {
        const slot = await Slot.findOneAndUpdate({ $and: [{ 'tag': req.params.tag }, { 'hub': hub._id }] }, req.body, { new: true })
            .catch(err => { return res.status(500).send(error(err.message)) });
        return (slot) ? res.send(success('Edit slot successful', slot)) : res.status(404).send(error('Slot not found'))
    }
    res.status(404).send(error('This hub does not exist'))
}

/** Delete a slot */
module.exports.deleteSlot = async (req, res) => {
    await check('tag', `Slot's tag is required`).not().isEmpty().run(req)
    await check('hubTag', `An assosciated hub tag is required`).not().isEmpty().run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error('Unprocessed Entity', errors.array().map(i => i['msg'])))

    const hub = await Hub.findOne({ 'tag': req.params.hubTag }).populate('slots')
        .catch(err => { return res.status(500).send(error(err.message)) })

    if (hub) {
        const sDelete = await Slot.findOneAndRemove({ $and: [{ 'tag': req.params.tag }, { 'hub': hub._id }] })
            .catch(err => { return res.status(500).send(error(err.message)) });
        return (sDelete) ? res.send(success('Delete slot successful')) : res.status(404).send(error('Slot not found'))
    }
    res.status(404).send(error('This hub does not exist'))
}