const { Hub, Slot } = require("../../models")

module.exports.connection = (ws) => {
    ws.on('message', (message) => {
        console.log("received: ", message)
        ws.send(Date.now())

        const task = message.split[0]
        const payload = message.split[1]

        console.log(typeof message)

        switch (task) {
            case "iot_connection": console.log("Device connected :-", payload)
                break
            case "iot_status": {
                const key = Object.keys(payload)
                const status = payload[key]
                switch (key) {
                    case "A1":
                        editSlot("A", "1", status)
                        break
                    case "B1":
                        editSlot("B", "1", status)
                        break
                    case "C2":
                        editSlot("C", "2", status)
                        break
                }
            }
        }
    })
}

// Update the status of the slot based on sensor message
async function editSlot(hubTag, slotTag, status) {
    const hub = await Hub.findOne({ 'tag': hubTag }).populate('slots').catch(err => console.log(err))
    if (hub) {
        const slot = await Slot.findOneAndUpdate({ $and: [{ 'tag': slotTag }, { 'hub': hub._id }] }, { status: status })
            .catch(console.log(err.message));
        return (slot) ? console.log("SLOT UPDATE :: Edit slot successful") : console.log("SLOT UPDATE :: Slot not found")
    }
    console.log("SLOT UPDATE :: This hub does not exist")
}