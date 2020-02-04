const { check, validationResult } = require('express-validator'),
    { Car, Driver } = require('../../models'),
    { error, success } = require('../../utils/response')

module.exports.create = async (req, res) => {
    await check('name', `Driver's name is required`).not().isEmpty().run(req)
    await check('phone', `Driver's phone is required`).not().isEmpty().run(req)
    await check('car', 'A car must be added').not().isEmpty().run(req)
    await check('car.numberPlate', 'Add a number plate to the car').not().isEmpty().run(req)

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error('Unprocessed Entity', errors.array().map(i => i['msg'])))

    const driver = await Driver.create(req.body).catch(err => { return res.status(500).send(error(err.message)) })
    if (driver._id) {
        const car = await Car.create({ ...req.body.car, driver: driver._id }).catch(err => { return res.status(500).send(error(err.message)) }) // Create a car assocaiated to a driver
        // Update driver model with new car
        driver.cars.push(car)
        driver.save()
        res.status(201).send(success('Driver created successfully', { ...driver._doc, cars: [car] }))
    }
}

module.exports.getAll = async (req, res) => {
    const { limit, page } = req.query
    const drivers = await Driver.find()
        .limit(parseInt(limit) || 20)
        .skip(parseInt(page) > 0 ? ((parseInt(page) - 1) * parseInt(limit)) : 0)
        .catch(err => { return res.status(500).send(error(err.message)) })
    res.send(success('Retrieve Drivers successfully', drivers))
}

module.exports.getOne = async (req, res) => {
    await check('phone', `Driver's phone is required`).not().isEmpty().run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error('Unprocessed Entity', errors.array().map(i => i['msg'])))

    const driver = await Driver.findOne({ 'phone': req.params.phone }).populate('cars')
        .catch(err => { return res.status(500).send(error(err.message)) })

    if (driver) return res.send(success('Retrieve Driver successfully', driver))
    res.status(404).send(error('Driver does not exist'))
}

module.exports.edit = async (req, res) => {
    await check('phone', `Driver's phone is required`).not().isEmpty().run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error('Unprocessed Entity', errors.array().map(i => i['msg'])))

    const driver = await Driver.findOneAndUpdate({ 'phone': req.params.phone }, req.body, { new: true }).catch(err => { return res.status(500).send(error(err.message)) });
    (driver) ? res.send(success('Edit Driver successfully', driver)) : res.status(404).send(error('Driver not found'))
}

module.exports.getCount = async (res) =>
    res.send(success('Total Number of registered drivers', await Driver.estimatedDocumentCount()))
