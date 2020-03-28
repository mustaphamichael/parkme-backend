const express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    cors = require('cors')
require('dotenv').config();

/** Application Modules**/
const driver = require('./src/systems/driver/route')
const distance = require('./src/systems/distance/route')
const car = require('./src/systems/car/route')
const hub = require('./src/systems/hub/route')
const clusters = require('./src/systems/cluster/route')
const navigation = require('./src/systems/navigation/route')

const app = express()
app.use(cors())
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

/** Database Connection */
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    poolSize: 10,
    keepAlive: true,
    keepAliveInitialDelay: 300000,
    socketTimeoutMS: 480000
}).then(() => console.log("DB connection successful"))
    .catch(error => console.log(`DB_CONNECTION_ERROR :: ${error}`))

/** Routes */
app.use('/api/parkme/drivers', driver)
app.use('/api/parkme/distances', distance)
app.use('/api/parkme/cars', car)
app.use('/api/parkme/hubs', hub)
app.use('/api/parkme/clusters', clusters)
app.use('/api/parkme/navigation', navigation)

/** Catch 404 and forward to error handler */
app.use(function (req, res, next) {
    const err = new Error('Not Found')
    err.status = 404;
    next(err)
});

// error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    // console.log("NODE SERVER ERROR: ", err); 
    const errorResponse = { message: err.message };
    res.status(err.status).send(errorResponse);
});

module.exports = app