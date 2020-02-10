const express = require("express"),
    router = express.Router(),
    controller = require("./controller")

// Create a terminal
router.post("/", (req, res) => controller.create(req, res))

// Get terminals
router.get("/", (req, res) => controller.getAll(req, res))

// Edit terminal
router.patch("/:id", (req, res) => controller.edit(req, res))

// Delete terminal
router.delete("/:id", (req, res) => controller.delete(req, res))

// Get number of registered terminals
router.get("/system/count", (_, res) => controller.getCount(res))

// Get a free slot closest to the destination
router.get("/:id/freeslot", (req, res) => controller.getFreeSlot(req, res))

module.exports = router