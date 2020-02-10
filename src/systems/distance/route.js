const express = require("express"),
    router = express.Router(),
    controller = require("./controller")

// Create a distance
router.post("/", (req, res) => controller.create(req, res))

// Edit distance
router.patch("/:id", (req, res) => controller.edit(req, res))

// Delete distance
router.delete("/:id", (req, res) => controller.delete(req, res))

module.exports = router