const { check, validationResult } = require("express-validator"),
    { Distance, Hub, Cluster, Slot, Terminal } = require("../../models"),
    { error, success } = require("../../utils/response")

module.exports.createCluster = async (req, res) => {
    await check("tag", "Cluster tag is required").not().isEmpty().run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error("Unprocessed Entity", errors.array().map(i => i["msg"])))

    const cluster = await Cluster.create(req.body).catch(err => { return res.status(500).send(error(err.message)) })
    return res.status(201).send(success("Create cluster successful", cluster))
}

module.exports.createTerminal = async (req, res) => {
    await check("cluster", "Cluster id is required").not().isEmpty().isMongoId().withMessage("Invalid Id").run(req)
    await check("name", "Terminal name is required").not().isEmpty().run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error("Unprocessed Entity", errors.array().map(i => i["msg"])))

    // Confirm cluster
    const cluster = await Cluster.findOne({ "_id": req.body.cluster })
        .catch(err => { return res.status(500).send(error(err.message)) })
    if (cluster) {
        const terminal = await Terminal.create({ ...req.body, cluster: cluster._id }).catch(err => { return res.status(500).send(error(err.message)) })
        return res.status(201).send(success("Create terminal successful", terminal))
    }
    return res.status(404).send(error("Cluster does not exist"))
}

module.exports.getClusters = async (req, res) => {
    const { limit, page, populate } = req.query
    const clusters = await Cluster.find()
        .populate(populate ? "distances" : "") // display expanded body
        .select(populate ? "" : "-distances") // remove distances from payload
        .limit(parseInt(limit) || 20)
        .skip(parseInt(page) > 0 ? ((parseInt(page) - 1) * parseInt(limit)) : 0)
        .catch(err => { return res.status(500).send(error(err.message)) })
    res.send(success("Retrieve clusters successfully", clusters))
}

module.exports.getTerminals = async (req, res) => {
    const { limit, page } = req.query
    const terminals = await Terminal.find()
        .limit(parseInt(limit) || 20)
        .skip(parseInt(page) > 0 ? ((parseInt(page) - 1) * parseInt(limit)) : 0)
        .catch(err => { return res.status(500).send(error(err.message)) })
    res.send(success("Retrieve terminal successfully", terminals))
}

module.exports.editCluster = async (req, res) => {
    await check("id", "Cluster id is required").not().isEmpty().isMongoId().withMessage("Invalid Id").run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error("Unprocessed Entity", errors.array().map(i => i["msg"])))

    // Remove terminal and distance in the payload
    delete req.body.terminals
    delete req.body.distances

    const cluster = await Cluster.findOneAndUpdate({ "_id": req.params.id }, req.body, { new: true })
        .catch(err => { console.log(errr); return res.status(500).send(error(err.message)) });
    (cluster) ? res.send(success("Edit cluster successfully", cluster))
        : res.status(404).send(error("Cluster not found"))
}

module.exports.editTerminal = async (req, res) => {
    await check("id", "Terminal id is required").not().isEmpty().isMongoId().withMessage("Invalid Id").run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error("Unprocessed Entity", errors.array().map(i => i["msg"])))

    const terminal = await Terminal.findOneAndUpdate({ "_id": req.params.id }, req.body, { new: true })
        .catch(err => { return res.status(500).send(error(err.message)) });
    (terminal) ? res.send(success("Edit terminal successfully", terminal))
        : res.status(404).send(error("Terminal not found"))
}

module.exports.getCount = async (res) =>
    res.send(success("Total Number of Terminals", await Terminal.estimatedDocumentCount()))

module.exports.delete = async (req, res) => {
    await check("id", "Terminal id is required").not().isMongoId().withMessage("Inavlid Id").isEmpty().run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error("Unprocessed Entity", errors.array().map(i => i["msg"])))

    const cDelete = await Terminal.findOneAndRemove(req.params.id).catch(err => { return res.status(500).send(error(err.message)) });
    (cDelete) ? res.send(success("Delete terminal successful")) : res.status(404).send(error("Terminal not found"))
}

module.exports.getFreeSlot = async (req, res) => {
    await check("id", "Terminal id is required").not().isEmpty().isMongoId().withMessage("Invalid Id").run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error("Unprocessed Entity", errors.array().map(i => i["msg"])))

    // Get the related cluster id
    const terminal = await Terminal.findOne({ "_id": req.params.id })
    if (!terminal) return res.status(404).send(error("Terminal does not exist"))

    // Sort out the hubs in the order of their distances
    const clusters = (await Distance.find({ "cluster": terminal.cluster }).sort("distance"))

    // Iterate through each hub
    // Return a free slot if available and stop the loop
    for (hub of clusters.map(i => i.hub)) {
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