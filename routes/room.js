const router = require('express').Router();
const Room = require('../models/Room')

router.post('/create', (req, res) => {
    const { roomName, roomCode, videoSize } = req.body
    let newRoom = Room({
        roomName,
        roomCode,
        videoSize
    })
    newRoom.save()
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