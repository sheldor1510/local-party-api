const express = require('express');
const cors = require("cors");
const mongoose = require('mongoose');
const socketIO = require("socket.io")

require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

const server = app.listen(port, err => {
    console.log(`API listening on port ${port}.`);
    if (err) throw err;
});

const io = socketIO(server, { cors: true, origins: '*:*' });

const mongoURI = process.env.DB_URI

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MongoDB connected.")
    });

app.set('view engine', 'ejs');
app.use('/public', express.static('public'))

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/room', require('./routes/room'))

const users = {};

io.on('connection', socket=>{
    socket.on('new-user-joined', data => {
        users[socket.id] = {name: data.name, roomCode: data.roomCode, pfp: data.pfp}; 
        socket.broadcast.emit('user-joined', {name: data.name, roomCode: data.roomCode, pfp: data.pfp})
    })

    socket.on('send', message => {
        socket.broadcast.emit('receive', {message: message, name: users[socket.id].name, roomCode: users[socket.id].roomCode, pfp: users[socket.id].pfp})
    })

    socket.on('disconnected', name => {
        socket.broadcast.emit('left', {name: users[socket.id].name, roomCode: users[socket.id].roomCode, pfp: users[socket.id].pfp})
        socket.disconnect(true);
    })

    socket.on('playerControl', data => { 
        socket.broadcast.emit('playerControlUpdate', {message: data.message, context: data.context, roomCode: users[socket.id].roomCode})
    })
})
