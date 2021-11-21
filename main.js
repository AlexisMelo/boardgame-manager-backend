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

io.on("connection", (socket) => {
    console.log("Nouvelle socket connectée !")

    socket.on("object-added", data => {
        socket.broadcast.emit("new-add", data)
    })

    socket.on("object-modified", data => {
        socket.broadcast.emit("new-modification", data)
    })
})

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
})