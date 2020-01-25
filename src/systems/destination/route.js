const express = require('express'),
    router = express.Router()

// Create a destination
router.post('/destinations', () => { })

// Get destinations
router.get('/destinations', () => { })

// Get a destination
router.get('/destinations/:id', () => { })

// Edit destination
router.patch('/destinations/:id', () => { })

// Delete destination
router.delete('/destinations/:id', () => { })

module.export = router