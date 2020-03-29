const mongoose = require("mongoose"),
    { Distance, Hub, Cluster, Slot, Terminal } = require("./src/models");
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
const mHubs = [{ tag: "A" }, { tag: "B" }, { tag: "C" }, { tag: "D" }] // Collection of slots
const mClusters = [{ tag: "1" }, { tag: "2" }, { tag: "3" }] // Colection of terminals/destinations

/** Seed slots and their hubs 
 * 2 slots per hub
*/
const seedSlots = async (hubs) => {
    for (const hub of hubs) {
        for (const s of Array(2).keys()) {
            // 'Slot.create' is used to accomodate for Mongoose 'save' middleware
            await Slot.create({ "tag": s + 1, "hub": hub })
                .catch(e => { console.log("SLOT_ERR ::", e); return })
        }
    }
}

/** Seed terminals
 * Studio24 and HealthBox are on Cluster 1
 * ShopRite and Film House are on Cluster 2
 * KFC, Dominos Pizza and Bukka Hut are on Cluster 3
 */
const seedTerminals = async (clusters) => {
    const body = [
        { name: "Studio24", cluster: clusters[0] },
        { name: "Health Box", cluster: clusters[0] },
        { name: "ShopRite", cluster: clusters[1] },
        { name: "Film House", cluster: clusters[1] },
        { name: "KFC", cluster: clusters[2] },
        { name: "Dominos Pizza", cluster: clusters[2] },
        { name: "Bukka Hut", cluster: clusters[2] },
    ]
    for (const i of body) {
        await Terminal.create(i).catch(e => { console.log("TERMINAL_ERR ::", e); return })
    }
}

/** Create distances between a clusters and hubs */
const seedDistance = async (clusters, hubs) => {
    // the distance between each cluster and hubs. Parent array for the clusters
    // while the children holds the distance value
    const distances = [[25.2, 10.5, 10.5, 20.1], [15.8, 15.8, 28.3, 28.3], [10.6, 25.2, 21.0, 10.6]]
    let count = 0
    for (const cluster in clusters) {
        for (const no in hubs) {
            const dist = { "cluster": clusters[cluster], "hub": hubs[no], "distance": distances[cluster][no] }
            // 'Distance.create' is used to accomodate for Mongoose 'save' middleware
            await Distance.create(dist).then(count += 1).catch(e => { console.log("DISTANCE_ERR ::", e); return })
        }
    }
    console.log(`Added ${count} distances between ${clusters.length} clusters and ${hubs.length} hubs`)
}

// Populate the db
async function populateDb() {
    // Add hubs
    const hubs = await Hub.insertMany(mHubs, { ordered: false })
        .catch(e => { console.log("HUB_ERR ::", e); return })
    console.log(`Added ${hubs.length} hubs`)

    // Add slots
    await seedSlots(hubs)

    // Add clusters
    const clusters = await Cluster.insertMany(mClusters, { ordered: false })
        .catch(e => { console.log("LANE_ERR ::", e); return })
    console.log(`Added ${clusters.length} clusters`)

    // Add destinations
    await seedTerminals(clusters)

    // Add distances
    await seedDistance(clusters, hubs)
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