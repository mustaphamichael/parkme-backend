const express = require('express'),
    router = express.Router(),
    controller = require('./controller')

// Create a parking hub
router.post('/', (req, res) => controller.createHub(req, res))

// Get hubs
router.get('/', (req, res) => controller.getHubs(req, res))

// Get a hub detail
router.get('/:tag', (req, res) => controller.getHub(req, res))

// Get number of hubs
router.get('/system/count', (_, res) => controller.getHubCount(res))

// Create a slot
router.post('/:hubTag/slots', (req, res) => controller.createSlot(req, res))

// Get a slot detail
router.get('/:hubTag/slots/:tag', (req, res) => controller.getSlot(req, res))

// Edit a slot
router.patch('/:hubTag/slots/:tag', (req, res) => controller.editSlot(req, res))

// Delete a slot
router.delete('/:hubTag/slots/:tag', (req, res) => controller.deleteSlot(req, res))

module.exports = router