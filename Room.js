class Room {
    players = {}
    name = null
    objects = []

    constructor(name) {
        this.name = name
    }

    join(username, socket) {
        this.players[username] = {
            socket: socket
        }

        socket.join(this.name)
    }

    addOrReplaceObject(object) {
        let object_replaced = false
        for (let i = 0; i < this.objects.length; i++) {
            if (this.objects[i].id === object.id) {
                this.objects[i] = object
                object_replaced = true
            }
        }
        if (!object_replaced) {
            this.objects.push(object)
        }
    }
}

module.exports = Room