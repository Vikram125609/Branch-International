const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const server = createServer(app);
const cors = require('cors');
require('./Database/Connection');

const { register } = require("./controller/register");

// web socket server
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

app.use(express.json());

// cors handling
app.use(cors({
    origin: '*'
}))

// api end points
app.post('/register', register);

io.on('connection', (socket) => {
    const { _id, name, role } = socket.handshake.query;
    if (role === 'Client') {
        socket.join(_id);
        const room = io.sockets.adapter.rooms;
        console.log(room);
    }
    if (role === 'Agent') {
        socket.join('Agent');
        const room = io.sockets.adapter.rooms;
        console.log(room);
    }
    socket.on('disconnect', () => {
        console.log('Dis')
    })
});

module.exports = server;
