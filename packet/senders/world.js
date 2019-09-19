// Sends the world information. This is required to be sent on login and
// whenever the player changes height (higher floors or dungeons).

var Encoder = require('../encoder');

module.exports.name = 'world';

module.exports.send = function (session, id) {
    return function () {
        var packet = new Encoder(id),
            player = session.player;

        // height right now is 452 / 944

        packet.addShort(player.index);
        packet.addShort(2304);
        packet.addShort(1776);
        packet.addShort(~~(452 / 944));
        packet.addShort(944);

        session.write(packet.build());
    };
};
