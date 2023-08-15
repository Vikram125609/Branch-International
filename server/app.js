const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const server = createServer(app);
const cors = require('cors');
require('./Database/Connection');

const { register } = require("./controller/register");
const highPriorityMessage = require("./model/highPriorityMessage");
const midPriorityMessage = require("./model/midPriorityMessage");
const lowPriorityMessage = require("./model/lowPriorityMessage");
const { totalPendingQuery } = require("./controller/query");

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
app.get('/totalPendingQuery', totalPendingQuery);

io.on('connection', (socket) => {
    console.log('connected');
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
            const message = new highPriorityMessage({
                name: data?.name,
                role: data?.role,
                clientId: data?._id,
                query: data?.chat
            });
            message.save().then(() => { });
            socket.to('highPriorityRoom').emit('queryInHighPriorityRoom', data);;
        }
        else if (regex2.test(data?.chat) || regex3.test(data?.chat)) {
            data = { ...data, priority: '1' };
            const message = new midPriorityMessage({
                name: data?.name,
                role: data?.role,
                clientId: data?._id,
                query: data?.chat
            });
            message.save().then(() => { });
            socket.to('mediumPriorityRoom').emit('queryInMediumPriorityRoom', data);;
        }
        else {
            data = { ...data, priority: '2' };
            const message = new lowPriorityMessage({
                name: data?.name,
                role: data?.role,
                clientId: data?._id,
                query: data?.chat
            });
            message.save().then(() => { console.log('Message is saved successfully') });
            socket.to('lowPriorityRoom').emit('queryInLowPriorityRoom', data);;
        }
        const totalPendingQuery = [];
        lowPriorityMessage.find({ ans: "" }).countDocuments().then((data) => {
            totalPendingQuery.push(data);
            midPriorityMessage.find({ ans: "" }).countDocuments().then((data) => {
                totalPendingQuery.push(data);
                highPriorityMessage.find({ ans: "" }).countDocuments().then((data) => {
                    totalPendingQuery.push(data);
                    io.to('Agent').emit('agentReceiveQuery', { totalPendingQuery });
                })
            })
        })
    });
    socket.on('agentAnswerQuery', (data) => {
        socket.to(data.clientId).emit('clientReceiveAnswer', data);
    });
    socket.on('agentJoinRoom', (data) => {
        const { roomType } = data;
        socket.join(roomType);
    });
    socket.on('agentLeaveRoom', (data) => {
        const { roomType } = data;
        socket.leave(roomType);

    });
    socket.on('disconnect', () => {
        console.log('Disconnected');
    });
});

module.exports = server;
