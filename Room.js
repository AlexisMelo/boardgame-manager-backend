class Room {
    players = null
    name = null
    objects = []

    constructor(name) {
        this.name = name
        this.players = {}
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
            console.log("j'ajoute un nouvel objet " + object.id + " dans " + this.name)
        }
    }
}

module.exports = Room