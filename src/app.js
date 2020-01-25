const express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    cors = require('cors')
require('dotenv').config();

/** Application Modules**/
const driver = require('./systems/driver/route')
const car = require('./systems/car/route')

const app = express()
app.use(cors())
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

/** Database Connection */
const dbUri = `mongodb://${process.env.MONGO_HOST}/${process.env.MONGO_DB}`
mongoose
    .connect(dbUri, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        poolSize: 10,
        keepAlive: true,
        keepAliveInitialDelay: 300000,
        socketTimeoutMS: 480000
    })
    .then(() => console.log("DB connection successful"))
    .catch(error => console.log(`DB_CONNECTION_ERROR :: ${error}`))

/** Routes */
app.use('/api/parkme/drivers', driver)
app.use('/api/parkme/cars', car)

/** Catch 404 and forward to error handler */
app.use(function (req, res, next) {
    const err = new Error('Not Found')
    next(err)
});

// error handler
app.use(function (err, req, res) {
    // console.log("NODE SERVER ERROR: ", err);
    const errorResponse = { error: true, message: err.message };
    console.log(errorResponse)
    res.status(500).json(errorResponse)
});

module.exports = app