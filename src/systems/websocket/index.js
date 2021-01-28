const { Hub, Slot } = require("../../models")

module.exports.connection = (ws) => {
    ws.on('message', (message) => {
        console.log("received: ", message)
        ws.send(`Time Received: ${Date.now()}`)
        parseMessage(message)
    })
}

function parseMessage(message) {
    try {
        const messageJson = JSON.parse(message)
        const task = messageJson[0]
        const payload = messageJson[1]

        switch (task) {
            case "iot_connection": console.log("Device connected :-", payload)
                break
            case "iot_status": {
                const key = Object.keys(payload)[0]
                const status = payload[key]
                updateSlotStatus(key, status)
            }
        }
    } catch (error) {
        // DO NOTHING
    }
}

async function updateSlotStatus(slot, status) {
    const hubTag = slot[0]
    const slotNum = slot[1]

    const hub = await Hub.findOne({ 'tag': hubTag }).populate('slots').catch(err => console.log(err))
    if (hub) {
        const slot = await Slot.findOneAndUpdate({ $and: [{ 'tag': slotNum }, { 'hub': hub._id }] }, { status: status })
            .catch(err => console.log(err.message));
        return (slot) ? console.log("Slot status updated successful") : console.log("Slot not found")
    }
    console.log("This hub does not exist")
}
