const express = require("express")
const http = require("http")
const {Server} = require("socket.io")
const path = require("path")
const Room = require("./Room");
const app = express()
const server = http.createServer()
hostname = "0.0.0.0"
port = "3000"

const io = new Server(server, {
    cors: {
        origin: `http://localhost:8080`
    }
})

app.use(express.static(path.join(__dirname, "views/")))

app.use(express.json())

let allRooms = {}

io.use((socket, next) => {
    const username = socket.handshake.auth.username
    if (!username) {
        return next(new Error("invalid username"))
    }
    const roomToJoin = socket.handshake.query.destinationRoom

    if (!(roomToJoin in allRooms)) { //roomToJoin = string, on vérifie si le nom de la room est dans les clés de l'objet allRooms
        allRooms[roomToJoin] = new Room(roomToJoin)
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

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
})
