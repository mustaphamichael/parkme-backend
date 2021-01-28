const app = require('./app'),
    debug = require('debug')('server:server'),
    http = require('http'),
    WebSocket = require('ws'),
    socketFn = require("./src/systems/websocket");

/**  Get port from environment and store in Express. */
let port = process.env.PORT || '5000';
app.set('port', port);
console.log("Running on port " + port);

/** Create HTTP server. */
const server = http.createServer(app);

/** Listen on provided port, on all network interfaces. */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/** Event listener for HTTP server "error" event. */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/** Event listener for HTTP server "listening" event. */
function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

// WebSocket Initialization
const wss = new WebSocket.Server({ server })
wss.on('connection', (ws) => {
    console.log("Connected!")

    // Keep Alive
    ws.isAlive = true
    ws.on('ping', function () {
        ws.send("pong")
        this.isAlive = true
    });
    ws.on('pong', function () {
        this.isAlive = true
    })

    socketFn.connection(ws)
    ws.send("Welcome");
})

const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.ping(function () { });
    });
}, 30000);

wss.on('close', function close() {
    clearInterval(interval);
});