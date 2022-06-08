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
        socket.join(data.roomCode);
        let newUsers = {}
        for (const [key, value] of Object.entries(users)) {
            if(value.roomCode == data.roomCode) {
                newUsers[key] = users[key]
            }
        }
        socket.broadcast.emit('user-joined', {name: data.name, roomCode: data.roomCode, pfp: data.pfp, members: Object.keys(newUsers).length})
        setTimeout(() => {
            socket.emit('updateMemberInfo', {roomCode: data.roomCode, members: Object.keys(newUsers).length})
        }, 500);
    })

    socket.on('send', message => {
        socket.to(users[socket.id].roomCode).emit('receive', {message: message, name: users[socket.id].name, pfp: users[socket.id].pfp})
    })

    socket.on('disconnectUser', name => {
        let newUsers = {}
        for (const [key, value] of Object.entries(users)) {
            if(value.roomCode == users[socket.id].roomCode) {
                newUsers[key] = users[key]
            }
        }
        socket.to(users[socket.id].roomCode).emit('left', {name: users[socket.id].name, pfp: users[socket.id].pfp, members: Object.keys(newUsers).length -1})
        delete users[socket.id]
        socket.disconnect(true);
    })

    socket.on('playerControl', data => { 
        socket.to(data.roomCode).emit('playerControlUpdate', {message: data.message, context: data.context, username: users[socket.id].name})
    })
    
    socket.on('disconnect', data =>{
        try {
            let newUsers = {}
            for (const [key, value] of Object.entries(users)) {
                if(value.roomCode == data.roomCode) {
                    newUsers[key] = users[key]
                }
            }
            socket.to(data.roomCode).emit('leftdefault', {name: data.name, pfp: data.pfp, members: Object.keys(newUsers).length -1})
            delete users[socket.id]
        } catch (error) {
            console.log(error)
        }
    })
})
