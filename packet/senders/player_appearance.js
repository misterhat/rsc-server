// Send all of the appearance related entity updates for players only.

var Encoder = require('../encoder');

    // Since we can combine many types of appearance-related updates in a single
    // packet, we need a way to differenciate them.
var updateTypes = {
    // Item bubbles overhead.
    BUBBLE: 0,

    // Player chat messages.
    CHAT: 1,

    // Hitpoint updates for players (draws heatlh bar).
    HITS: 2,

    // A projectile heading toward an NPC.
    NPC_PROJECTILE: 3,

    // A projectile heading toward a player.
    PLAYER_PROJECTILE: 4,

    // Updates players clothes, wielded item animation IDs, skulls, combat
    // levels etc.
    APPEARANCE: 5
};

module.exports.name = 'playerAppearance';

module.exports.send = function (session, id) {
    return function () {
        var player = session.player,

            updateSize, packet, updatee, chat,

            i, j;

        updateSize =
            player.toUpdate.playerAppearances.length +
            player.toUpdate.playerChat.length;

        // Don't bother with this packet if there aren't any updates to perform.
        if (!updateSize) {
            return;
        }

        packet = new Encoder(id);

        // The amount of updates to perform.
        packet.addShort(updateSize);

        for (i = 0; i < player.toUpdate.playerChat.length; i += 1) {
            chat = player.toUpdate.playerChat.shift();

            packet.addShort(chat.sender.index);
            packet.addByte(updateTypes.CHAT);

            packet.addByte(chat.message.length);
            packet.addBytes(chat.message);
        }

        for (i = 0; i < player.toUpdate.playerAppearances.length; i += 1) {
            updatee = player.toUpdate.playerAppearances.shift();

            packet.addShort(updatee.index);
            packet.addByte(updateTypes.APPEARANCE);

            // The animation index is incremented by one every time the player's
            // appearance is updated.
            packet.addShort(updatee.animationIndex);

            packet.addLong(updatee.encodedUsername);

            // The length of the following animation ID sequence (which, for
            // players, should always be twelve). The animation ID sequence
            // covers animation identifiers for the player's head, body and legs
            // and any accompanying wielded items.
            packet.addByte(12);

            for (j = 0; j < updatee.sprites.length; j += 1) {
                packet.addByte(updatee.sprites[j]);
            }

            // The hair, top, trouser and skin colours, respectively.
            packet.addByte(player.appearance.hairColour);
            packet.addByte(player.appearance.topColour);
            packet.addByte(player.appearance.legColour);
            packet.addByte(player.appearance.skinColour);

            // The player's combat level.
            packet.addByte(3);

            // Whether or not the player is skulled.
            packet.addByte(0);
        }

        session.write(packet.build());
    };
};
