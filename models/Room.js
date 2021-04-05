const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomName: {
        type: String,
        required: true,
    },
    roomCode: {
        type: String,
        required: true
    },
    videoSize: {
        type: Number,
        required: true
    }
})

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;