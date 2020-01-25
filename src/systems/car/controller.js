const { check, validationResult } = require('express-validator'),
    { Car, Driver } = require('../../models'),
    { error, success } = require('../../utils/response')

module.exports.create = async (req, res) => {
    await check('phone', 'Driver is required').not().isEmpty().run(req)
    await check('numberPlate', 'Number plate is required').not().isEmpty().run(req)
    await check('manufacturer', 'Manufacturer is required').not().isEmpty().run(req)
    await check('model', 'Model is required').not().isEmpty().run(req)

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error('Unprocessed Entity', errors.array().map(i => i['msg'])))

    const driver = await Driver.findOne({ phone: req.body.phone }).populate('cars')
        .catch(err => { return res.status(500).send(error(err.message)) })

    // Ensure the driver does not add an existing car
    const existingCars = driver.cars.filter(c => c.numberPlate === req.body.numberPlate)
    if (existingCars.length > 0) return res.status(409).send(error('You have a car with this number plate'))

    const car = await Car.create({ ...req.body, driver: driver._id }).catch(err => { return res.status(500).send(error(err.message)) }) // Create a car assocaiated to a driver
    // Update driver model with new car
    driver.cars.push(car)
    driver.save()
    res.status(201).send(success('Car created successfully', car))
}

module.exports.getPerDriver = async (req, res) => {
    await check('phone', `Driver's phone is required`).not().isEmpty().run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error('Unprocessed Entity', errors.array().map(i => i['msg'])))

    const driver = await Driver.findOne({ 'phone': req.params.phone }).catch(err => { return res.status(500).send(error(err.message)) })
    if (driver) {
        const cars = await Car.find({ driver: driver._id }).catch(err => { return res.status(500).send(error(err.message)) })
        return res.status(200).send(success('Retrieve car successful', cars))
    } res.status(404).send(error('Driver does not exist'))
}

module.exports.getCount = async (res) =>
    res.send(success('Total Number of registered cars', await Car.estimatedDocumentCount()))

module.exports.edit = async (req, res) => {
    await check('id', 'Car identification is required').not().isEmpty().run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error('Unprocessed Entity', errors.array().map(i => i['msg'])))

    const car = await Car.findOneAndUpdate(req.params.id, req.body, { new: true }).catch(err => { return res.status(500).send(error(err.message)) });
    (car) ? res.send(success('Edit car successful', car)) : res.status(404).send(error('Car not found'))
}

module.exports.delete = async (req, res) => {
    await check('id', 'Car identification is required').not().isEmpty().run(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(error('Unprocessed Entity', errors.array().map(i => i['msg'])))

    const cDelete = await Car.findOneAndRemove(req.params.id).catch(err => { return res.status(500).send(error(err.message)) });
    (cDelete) ? res.send(success('Delete car successful')) : res.status(404).send(error('Car not found'))
}
