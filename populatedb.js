const mongoose = require("mongoose"),
    { Distance, Hub, Slot, Terminal } = require("./src/models");
require("dotenv").config();

// Connect to the database
mongoose.connect(process.env.MONGO_URL,
    { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
    .then(_ => {
        console.log(`Database connection successful...`);
        populateDb();
    })
    .catch(error => console.log(`Database connection Error: ${error}`))

/** Seed hubs */
const mHubs = [{ tag: "A" }, { tag: "B" }, { tag: "C" }]

/** Seed slots and their hubs */
const seedSlots = async (hubs) => {
    for (const hub of hubs) {
        // Add 2 slots per hub
        for (const s of Array(2).keys()) {
            // 'Slot.create' is used to accomodate for Mongoose 'save' middleware
            await Slot.create({ "tag": s + 1, "hub": hub })
                .catch(e => { console.log("SLOT_ERR ::", e); return })
        }
    }
}

/** Seed terminals */
const seedTerminals = async () => {
    let body = []
    const sudoName = "Terminal"
    for (const index of Array(4).keys()) {
        body.push({ "name": `${sudoName}_${index}` })
    }
    return await Terminal.insertMany(body, { ordered: false })
        .catch(e => console.log("TERMINAL_ERR ::", e))
}

/** Create distances between a terminals and hubs */
const seedDistance = async (terminals, hubs) => {
    let count = 0
    for (const i of terminals) {
        for (const j of hubs) {
            // create random distance between 0 and 100
            const p = { "terminal": i, "hub": j, "distance": Number((Math.random() * Math.floor(100)).toFixed(2)) }
            // 'Distance.create' is used to accomodate for Mongoose 'save' middleware
            await Distance.create(p).then(count += 1)
                .catch(e => console.log("DISTANCE_ERR ::", e))
        }
    }
    console.log(`Added ${count} distances between ${terminals.length} terminals and ${hubs.length} hubs`)
}

// Populate the db
async function populateDb() {
    // Add hubs
    const hubs = await Hub.insertMany(mHubs, { ordered: false })
        .catch(e => { console.log("HUB_ERR ::", e); return })
    console.log(`Added ${hubs.length} hubs`)

    // Add slots
    await seedSlots(hubs)

    // Add destinations
    const terminals = await seedTerminals()
    console.log(`Added ${terminals.length} terminals`)

    // Add distances
    await seedDistance(terminals, hubs)
    closeDb()
}

// Close database connection
function closeDb() {
    mongoose.disconnect().then(_ => {
        console.log("...Database disconnection successful")
        process.exit(0, "Done")
    }).catch(error => {
        console.log(`Database disconnection error: ${error}`)
        process.exit(500, "Database Error")
    });
}