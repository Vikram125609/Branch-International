const { Schema, model } = require('mongoose');
const messageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    }
});

const message = model('message', messageSchema);
module.exports = message;