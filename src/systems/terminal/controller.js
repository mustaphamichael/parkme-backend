const { check, validationResult } = require("express-validator"),
    { Distance, Hub, Slot, Terminal } = require("../../models"),
    { error, success } = require("../../utils/response")

module.exports.create = async (req, res) => {
    await check("name", "Terminal name is required").not().isEmpty().run(req)

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error("Unprocessed Entity", errors.array().map(i => i["msg"])))

    const terminal = await Terminal.create(req.body).catch(err => { return res.status(500).send(error(err.message)) })
    return res.status(201).send(success("Create terminal successful", terminal))
}

module.exports.getAll = async (req, res) => {
    const { limit, page, populate } = req.query
    const terminals = await Terminal.find()
        .populate(populate ? "distances" : "") // display expanded body
        .select(populate ? "" : "-distances") // remove distances from payload
        .limit(parseInt(limit) || 20)
        .skip(parseInt(page) > 0 ? ((parseInt(page) - 1) * parseInt(limit)) : 0)
        .catch(err => { return res.status(500).send(error(err.message)) })
    res.send(success("Retrieve terminal successfully", terminals))
}

module.exports.edit = async (req, res) => {
    await check("id", "Terminal id is required").not().isEmpty().run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error("Unprocessed Entity", errors.array().map(i => i["msg"])))

    // Remove distance in the body
    delete req.body.distances

    const terminal = await Terminal.findOneAndUpdate({ "_id": req.params.id }, req.body, { new: true })
        .catch(err => { return res.status(500).send(error(err.message)) });
    (terminal) ? res.send(success("Edit terminal successfully", terminal)) : res.status(404).send(error("Terminal not found"))
}

module.exports.getCount = async (res) =>
    res.send(success("Total Number of Terminals", await Terminal.estimatedDocumentCount()))

module.exports.delete = async (req, res) => {
    await check("id", "Terminal id is required").not().isEmpty().run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error("Unprocessed Entity", errors.array().map(i => i["msg"])))

    const cDelete = await Terminal.findOneAndRemove(req.params.id).catch(err => { return res.status(500).send(error(err.message)) });
    (cDelete) ? res.send(success("Delete terminal successful")) : res.status(404).send(error("Terminal not found"))
}

module.exports.getFreeSlot = async (req, res) => {
    // 1. Sort out the hubs in the order of their distances
    const terminals = (await Distance.find({ "terminal": req.params.id }).sort("distance"))
    if (!terminals) return res.status(404).send(error("Terminal does not exist"))

    // Iterate through each hub
    // Return a free slot if available and stop the loop
    for (hub of terminals.map(i => i.hub)) {
        // Fetch each slot status
        const { tag, slots } = (await Hub.findOne({ "_id": hub }).populate("slots"))
        const free = slots.filter(s => s.status === 0)
        if (free.length > 0) {
            const message = `Kindly find your parking slot at\nHUB ${tag} :: SLOT ${free[0].tag}`
            return res.send(success(message, { hub: tag, tag: free[0].tag })) // hub = Hub Tag, tag = Slot tag
        }
    }
    return res.send(success("There is no parking slot available"))
}

/** What happens after driver accepts allocated parking slot */
module.exports.handleDriverSelection = async (req, res) => {
    await check("hub", "Hub tag is required").not().isEmpty().run(req)
    await check("tag", "Slot tag is required").not().isEmpty().run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error("Unprocessed Entity", errors.array().map(i => i["msg"])))

    // Update the slot status to 2 (Assigned)
    const hub = await Hub.findOne({ "tag": req.body.hub }).populate("slots")
        .catch(err => { return res.status(500).send(error(err.message)) })

    if (hub) {
        const slot = await Slot.findOneAndUpdate({ $and: [{ "tag": req.body.tag }, { "hub": hub._id }] }, { status: 2 })
            .catch(err => { return res.status(500).send(error(err.message)) });
        return (slot) ? res.send(success("Success")) : res.status(404).send(error("Slot not found"))
    }
    res.status(404).send(error("Hub not found"))

    // TODO: Alert the IOT device (Blink Indicator)
}