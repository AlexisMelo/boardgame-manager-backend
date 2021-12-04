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

let rooms = []

io.use((socket, next) => {
    const username = socket.handshake.auth.username
    if (!username) {
        return next(new Error("invalid username"))
    }
    socket.username = username
    next()
})

io.on("connection", (socket) => {
    console.log(`Nouvelle socket de ${socket.username} connectée !`)

    socket.on("object-added", data => {
        socket.broadcast.emit("new-add", data)
    })

    socket.on("object-modified", data => {
        socket.broadcast.emit("new-modification", data)
    })

    socket.on("disconnect", () => {
        console.log(`Socket ${socket.username} déconnectée `)
    })
})


server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
})
