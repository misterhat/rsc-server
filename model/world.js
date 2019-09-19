var events = require('events'),
    util = require('util');

function addEntity(entities, entity) {
    var position;

    // If the open list is empty, no gaps in the entity list have been created
    // yet, so push the entity to the end.
    if (!entities.open.length) {
        entities.list.push(entity);
        entity.index = entities.list.length - 1;
    // Since the open list isn't empty, there are gaps in the array that we
    // need to fill with the values of the open list. Shift a position off of
    // the the open list and fill the gap in the entity list.
    } else {
        position = entities.open.shift();
        entities.list[position] = entity;
        entity.index = position;
    }
}

function removeEntity(entities, entity) {
    // Deleting the entity element in the list will create a gap, so note the
    // position this entity had in the list so we can fill it when the next
    // entity is added.
    entities.list[entity.index] = null;
    delete entities.list[entity.index];
    entities.open.push(entity.index);
}

function World() {
    events.EventEmitter.call(this);

    this.players = {
        list: [],
        open: []
    };

    // Avoid making a new function object on every tick.
    this.tickCall = this.tick.bind(this);

    // Start the update loop.
    this.tick();
}

util.inherits(World, events.EventEmitter);

World.prototype.addPlayer = function (player) {
    addEntity(this.players, player);

    // Emit that a player has been added to the world so we can notify other
    // players and adjust updates accordingly.
    this.emit('addPlayer', player);
};

World.prototype.removePlayer = function (player) {
    console.log('trying to remove player', player.index);

    removeEntity(this.players, player);

    // Likewise with emitting "addPlayer", emit when a player has been removed.
    this.emit('removePlayer', player);
};

// Send all entity updates to each connected player.
World.prototype.tick = function () {
    var i, player;

    for (i = 0; i < this.players.list.length; i += 1) {
        player = this.players.list[i];

        if (player) {
            player.update();
        }
    }

    setTimeout(this.tickCall, 600);
};

module.exports = World;
