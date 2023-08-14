const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const server = createServer(app);
const cors = require('cors');
require('./Database/Connection');

const { register } = require("./controller/register");

const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

app.use(express.json());

app.use(cors({
    origin: '*'
}))

app.post('/register', register);

io.on('connection', (socket) => {
    const { _id, name, role } = socket.handshake.query;
    if (role === 'Client') {
        socket.join(_id);
    }
    if (role === 'Agent') {
        socket.join('Agent');
    }
    socket.on('clientSendQuery', (data) => {
        socket.to('Agent').emit('agentReceiveQuery',data);
    });
    socket.on('agentAnswerQuery', (data) => {
        socket.to(data.clientId).emit('clientReceiveAnswer', data);
    })
    socket.on('disconnect', () => {
        console.log('Disconnected')
    })
});

module.exports = server;
