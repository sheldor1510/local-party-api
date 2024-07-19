const router = require('express').Router();
const Room = require('../models/Room')
const axios = require('axios')

router.get('/create', (req, res) => {
    const { roomName, roomCode, videoSize } = req.body
    let newRoom = Room({
        roomName,
        roomCode,
        videoSize
    })
    newRoom.save()
    axios.post('https://discord.com/api/webhooks/1263748944593162292/AICgAqV5QkZr5F1z9jDiybMZnAnTboDaXAHsY5uVIKBGE6ZmZCBP7BDvpB0y0I3t1mYJ', {
        content: `${roomName} has been created`
    })
    .then((response) => {
        console.log(response)
    })
    .catch((error) => {
        console.log(error)
    })
    res.send({message: "success"})
});

router.post('/join', (req, res) => {
    const { roomCode, videoSize } = req.body
    Room.findOne({roomCode}).then(room => {
        if(!room) {
            res.send(
                {
                    message: "room code invalid"
                }
            )
        } else {
            if(room.videoSize != videoSize) {
                res.send(
                    {
                        message: "video is different than the host's video."
                    }
                )
            } else {
                res.send(
                    {
                        roomCode,
                        videoSize,
                        roomName: room.roomName,
                        message: "success"
                    }
                )
            }
        }
    })
})

module.exports = router;