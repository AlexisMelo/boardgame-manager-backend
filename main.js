const express = require("express")
const http = require("http")
const {Server} = require("socket.io")
const path = require("path")
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

io.use((socket, next) => {
    const username = socket.handshake.auth.username
    if (!username) {
        return next(new Error("invalid username"))
    }
    const room = socket.handshake.query.destinationRoom
    socket.join(room)
    socket.username = username
    next()
})

io.on("connection", (socket) => {
    console.log(`Nouvelle socket de ${socket.username} connectée !`)

    for(const room of socket.rooms) {
        socket.to(room).emit("socket_connecting", {username : socket.username})
    }

    socket.on("object-added", data => {
        socket.to(data.room).emit("new-add", {obj : data.obj, obj_id: data.obj_id})
    })

    socket.on("object-modified", data => {
        socket.to(data.room).emit("new-modification", {obj : data.obj, obj_id: data.obj_id})
    })

    socket.on("disconnecting", () => {
        for(const room of  socket.rooms) {
            socket.to(room).emit("socket_disconnecting", {username : socket.username})
        }
        console.log(`Socket de ${socket.username} déconnectée !`)
    })
})

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
})
