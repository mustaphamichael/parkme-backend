const redis = require('redis'),
    client = redis.createClient()

/** Save entity */
module.exports.save = (key, data) => client.set(key, data, redis.print)

/** Get entity */
module.exports.get = async (key) => await client.get(key)