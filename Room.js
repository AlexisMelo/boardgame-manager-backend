class Room {
    players = {}
    name = null
    objects = null

    constructor(name, objects) {
        this.name = name
        this.objects = objects || []
    }

    join(username, socket) {
        this.players[username] = {
            socket: socket
        }

        socket.join(this.name)
    }

    leave(username, socket) {
        socket.leave(this.name)
        delete this.players[username]
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