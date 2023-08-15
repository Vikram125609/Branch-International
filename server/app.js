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
        const regex1 = new RegExp('Loan', 'i');
        const regex2 = new RegExp('Payment', 'i');
        const regex3 = new RegExp('Pay', 'i');
        if (regex1.test(data?.chat)) {
            data = { ...data, priority: '0' };
        }
        else if (regex2.test(data?.chat) || regex3.test(data?.chat)) {
            data = { ...data, priority: '1' };
        }
        else {
            data = { ...data, priority: '2' };
        }
        io.to('Agent').emit('agentReceiveQuery', data);
    });
    socket.on('agentAnswerQuery', (data) => {
        socket.to(data.clientId).emit('clientReceiveAnswer', data);
    });
    socket.on('agentJoinRoom', (data) => {
        // socket.join(data?.roomType);
    });
    socket.on('disconnect', () => {
    });
});

module.exports = server;
