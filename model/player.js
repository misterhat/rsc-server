var util = require('util'),

    encode = require('../operations/username').encode,
    Character = require('./character'),
    Point = require('./point');

var APPEARANCE = {
    headSprite: 0,
    bodySprite: 1,
    hairColour: 2,
    topColour: 8,
    legColour: 14,
    skinColour: 0
};

function Player(session, username) {
    Character.call(this);

    this.session = session;
    this.username = username;

    this.world = this.session.server.world;

    // The encoded username is used in appearance updates and contact list
    // updates.
    this.encodedUsername = encode(this.username);

    // The sprites sent in appearance updates.
    this.sprites = [1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // The default X, Y coordinates of the player.
    this.position = new Point(122, 657);

    // The animation index is incremented every time this player's appearance
    // is updated.
    this.animationIndex = 0;

    // All of the things needing to be updated in each game tick (~600ms).
    this.toUpdate = {
        // Updated whenever a nearby player's coordinates changes.
        playerPositions: {},

        // Updated whenever a nearby player speaks.
        playerChat: [],

        // Updated whenever a nearby player's appearance changes.
        playerAppearances: []
    };

    // All of the entities this player knows about.
    this.known = {
        players: []
    };

    // New entities that haven't been added to known yet.
    this.added = {
        players: []
    };

    // Entities that are currently known but need to be removed.
    this.removed = {
        players: {}
    };

    // The walking queue (which is shifted every game tick).
    this.walkQueue = [];

    // The direction they're facing.
    this.direction = 0;
}

util.inherits(Player, Character);

Player.prototype.listen = function () {
    var that = this;

    // Add listeners to the existing logged in players.
    this.world.players.list.forEach(function (player) {
        if (player !== that) {
            that.added.players.push(player);
            that.toUpdate.playerAppearances.push(player);
            player.on('appearance', function () {
                that.toUpdate.playerAppearances.push(player);
            });

            player.on('chat', function (chat) {
                that.toUpdate.playerChat.push(chat);
            });

            player.on('move', function () {
                that.toUpdate.playerPositions[player.index] = true;
            });
        }
    });

    // Add listeners to newly added players.
    this.world.on('addPlayer', function (player) {
        if (player !== that) {
            that.added.players.push(player);
            that.toUpdate.playerAppearances.push(player);

            player.on('appearance', function () {
                that.toUpdate.playerAppearances.push(player);
            });

            player.on('chat', function (chat) {
                that.toUpdate.playerChat.push(chat);
            });

            player.on('move', function () {
                that.toUpdate.playerPositions[player.index] = true;
            });
        }
    });

    this.world.on('removePlayer', function (player) {
        if (player !== that) {
            that.removed.players[player.index] = true;
        }
    });
};

// Start listening for world events and add this player to the world.
Player.prototype.login = function () {
    this.listen();
    this.world.addPlayer(this);
    this.session.send.world();
    this.setAppearance(APPEARANCE);
};

// Disassociate the session with this player and remove him from the world.
Player.prototype.destroy = function () {
    this.emit('destroy');
    this.session.player = null;
    this.world.removePlayer(this);
};

// Destroy the player and send the log out succcess packet to let the client
// know the logout was successful.
Player.prototype.logout = function () {
    this.session.send.logoutSuccess();
    this.destroy();
    this.session.close();
};

// update the player's appearance and let all the listening players know.
Player.prototype.setAppearance = function (appearance) {
    if (appearance) {
        this.sprites[0] = appearance.headSprite + 1;
        this.sprites[1] = appearance.bodySprite + 1;

        this.appearance = appearance;
    }

    this.animationIndex += 1;
    this.toUpdate.playerAppearances.push(this);
    this.emit('appearance');
};

// Move the character in a direction based on deltas. Either should be between
// -1 and 1 (inclusive).
Player.prototype.move = function (deltaX, deltaY) {
    var oldX = this.position.x,
        oldY = this.position.y;

    this.position.x += deltaX;
    this.position.y += deltaY;

    this.direction = this.position.direction(oldX, oldY);

    this.emit('move', this.direction);
};

// Send all of the relevant updates on game tick.
Player.prototype.update = function () {
    var movement;

    // Check if we still need to take any steps.
    if (this.walkQueue.length) {
        // Shift the first value off of the list and move in the specified
        // deltas.
        movement = this.walkQueue.shift();
        this.move(movement.x, movement.y);
    }

    this.session.send.playerMovement();
    this.session.send.playerAppearance();
};

module.exports = Player;
