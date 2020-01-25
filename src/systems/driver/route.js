const express = require('express'),
    controller = require('./controller'),
    router = express.Router()

// Create a driver
router.post('/', (req, res) => controller.create(req, res))

// Get drivers
router.get('/', (req, res) => controller.getAll(req, res))

// Get a driver`
router.get('/:phone', (req, res) => controller.getOne(req, res))

// Edit driver detail
router.patch('/:phone', (req, res) => controller.edit(req, res))

// Get number of registered drivers
router.get('/system/count', (_, res) => controller.getCount(res))

module.exports = router