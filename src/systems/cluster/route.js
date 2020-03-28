const express = require("express"),
    router = express.Router(),
    controller = require("./controller")

// Create a cluster(A cluster is a grouping for terminals)
router.post("/", (req, res) => controller.createCluster(req, res))

router.post("/terminals", (req, res) => controller.createTerminal(req, res))

// Get clusters
router.get("/", (req, res) => controller.getClusters(req, res))

// Get terminals
router.get("/terminals", (req, res) => controller.getTerminals(req, res))

// Edit cluster
router.patch("/:id", (req, res) => controller.editCluster(req, res))

// Edit terminal
router.patch("/terminals/:id", (req, res) => controller.editTerminal(req, res))

// Get number of registered terminals
router.get("/terminals/count", (_, res) => controller.getCount(res))

// Get a free slot closest to the destination
router.get("/terminals/:id/freeslot", (req, res) => controller.getFreeSlot(req, res))

// Handle driver's acceptance of allocated slot
router.post("/selection/accept", (req, res) => controller.handleDriverSelection(req, res))

module.exports = router