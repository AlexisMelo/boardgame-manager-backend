const express = require("express")
const http = require("http")
const {Server} = require("socket.io")
const path = require("path")
const Room = require("./Room");
const app = express()
const server = http.createServer()
const router = express.Router()
hostname = "0.0.0.0"
port = "3000"

const io = new Server(server, {
    cors: {
        origin: `http://localhost:8080`
    }
})

app.use(express.static(path.join(__dirname, "views/")))

app.use(express.json())

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8080")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

let allRooms = {}

io.use((socket, next) => {
    const username = socket.handshake.auth.username
    if (!username) {
        return next(new Error("Invalid username"))
    }
    const roomToJoin = socket.handshake.query.destinationRoom

    if (!(roomToJoin in allRooms)) {
        return next(new Error("Room does not exist"))
    }

    allRooms[roomToJoin].join(username, socket)
    socket.username = username
    next()
})

io.on("connection", (socket) => {
    console.log(`Nouvelle socket de ${socket.username} connectée !`)

    for (const room of socket.rooms) {
        socket.to(room).emit("socket_connecting", socket.username)
    }

    socket.on("init-objects", data => {
        socket.emit("init-objects", allRooms[data.room].objects)
    })

    socket.on("init-players", data => {
        socket.emit("init-players", Object.keys(allRooms[data.room].players))
    })

    socket.on("object-added", data => {
        data.obj.id = data.obj_id //on devrait pouvoir mettre l'id direct dans l'objet envoyé, mais pas réussi donc obligé de reconstruire l'objet
        allRooms[data.room].addOrReplaceObject(data.obj)
        socket.to(data.room).emit("new-add", data.obj)
    })

    socket.on("object-modified", data => {
        data.obj.id = data.obj_id //on devrait pouvoir mettre l'id direct dans l'objet envoyé, mais pas réussi donc obligé de reconstruire l'objet
        allRooms[data.room].addOrReplaceObject(data.obj)
        socket.to(data.room).emit("new-modification", data.obj)
    })

    socket.on("disconnecting", () => {
        for (const room of socket.rooms) {
            socket.to(room).emit("socket_disconnecting", socket.username)
            if (Object.keys(allRooms).includes(room)) {
                allRooms[room].leave(socket.username, socket)
            }
        }
        console.log(`Socket de ${socket.username} déconnectée !`)
    })
})

router.post("/room/create", (req, res) => {
    let roomName = req.body.room_name
    if (roomName in allRooms) {
        return res.status(409).send({message: "Room already exists"})
    }
    allRooms[roomName] = new Room(roomName, req.body.objects)
    res.status(200)
    return res.end()
})

router.get("/room/:room_id", function(req, res) {
    let roomName = req.params.room_id
    if (roomName in allRooms) {
        return res.status(200).send()
    }
    return res.status(404).send({message: "Room does not exist"})
})

app.use("/", router)

server.listen(port, hostname, () => {
    console.log(`Socket server running at http://${hostname}:${port}/`);
})

app.listen(3001, hostname, () => {
    console.log("Express app running")
})