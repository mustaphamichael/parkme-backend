const express = require('express')
const router = express.Router()

// Create a parking hub
router.post('/hubs', () => { })

// Get hubs
router.get('/hubs', () => { })

// Get a hub detail
router.get('/hubs/:id', () => { })

// Edit hub
router.patch('/hubs/:id', () => { })

// Create a slot
router.post('/slots', () => { })

// Get a slot detail
router.get('/slots/:id', () => { })

// Edit a slot
router.patch('/slots/:id', () => { })

// Delete a slot
router.delete('/slots/:id', () => { })

module.export = router