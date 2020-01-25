const express = require('express'),
    router = express.Router(),
    controller = require('./controller')

// Create a car
router.post('/', (req, res) => controller.create(req, res))

router.get('/driver/:phone', (req, res) => controller.getPerDriver(req, res))

// Get number of registered cars
router.get('/system/count', (_, res) => controller.getCount(res))

// Edit car detail
router.patch('/:id', (req, res) => controller.edit(req, res))

router.delete('/:id', (req, res) => controller.delete(req, res))

module.exports = router