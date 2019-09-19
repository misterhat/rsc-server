// Sends all of the position and direction information related to the current
// player and those around him.

var Encoder = require('../encoder');

module.exports.name = 'playerMovement';

module.exports.send = function (session, id) {
    return function () {
        var packet = new Encoder(id),

            player = session.player,

            knownPlayer, hasRemoved, hasMoved, addedPlayer, offsets, i;

        // The current player's position.
        packet.addBits(player.position.x, 11);
        packet.addBits(player.position.y, 13);

        // The current player's direction.
        packet.addBits(player.direction, 4);

        // How many other players does the client know about (how many are
        // nearby enough to update)?
        packet.addBits(player.known.players.length, 8);

        for (i = 0; i < player.known.players.length; i += 1) {
            knownPlayer = player.known.players[i];

            hasRemoved = player.removed.players[knownPlayer.index];
            hasMoved = player.toUpdate.playerPositions[knownPlayer.index];

            if (hasRemoved) {
                packet.addBits(1, 1);
                packet.addBits(1, 1);
                packet.addBits(12, 4);

                player.known.players.splice(i, 1);
                delete player.removed.players[knownPlayer.index];
            } else if (hasMoved) {
                packet.addBits(1, 1);
                packet.addBits(0, 1);
                packet.addBits(knownPlayer.direction, 3);

                delete player.toUpdate.playerPositions[knownPlayer.index];
            } else {
                packet.addBits(0, 1);
            }
        }

        // Notify this client of all of the new players nearby.
        for (i = 0; i < player.added.players.length; i += 1) {
            // Remove the player from the added list since they're now known.
            addedPlayer = player.added.players.shift();

            // Add them to the known list.
            player.known.players.push(addedPlayer);

            packet.addBits(addedPlayer.index, 11);

            // The new player's current coordinates relative to ours.
            offsets = player.position.offsets(addedPlayer.position);

            packet.addBits(offsets.x, 5);
            packet.addBits(offsets.y, 5);

            // The new player's current direction.
            packet.addBits(addedPlayer.direction, 4);

            // A mystery bit (it's always 0 for now).
            packet.addBits(0, 1);
        }

        session.write(packet.build());
    };
};
