const express = require("express"),
    router = express.Router(),
    fs = require("fs"),
    path = require("path"),
    { error } = require("../../utils/response")

router.get("/images/gate/:gateNo/hub/:hubTag", (req, res) => {
    const { gateNo, hubTag } = req.params
    const imagePath = path.join("./src/systems/navigation/images", `Gate${gateNo}-Hub${hubTag.toUpperCase()}.jpg`)
    fs.readFile(imagePath, (err, data) => {
        if (err) {
            console.log(err)
            res.send(error("Image does not exist"))
        } else {
            res.writeHead(200, { "Content-Type": "image/jpg" })
            res.end(data)
        }
    })
})

module.exports = router