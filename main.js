const express = require("express")
const http = require("http")
const {Server} = require("socket.io")
const path = require("path")
const app = express()
const server = http.createServer()
const io = new Server(server)

app.use(express.static(path.join(__dirname, "views/")))

app.use(express.json())

io.on("connection", (socket) => {
    //???
})

server.listen(3000, () => {
    console.log("Listening on port 3000")
})