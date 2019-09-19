// Sends a generic alert box to a player. It's probably used in some quests.

var Encoder = require('../encoder');

module.exports.name = 'alert';

module.exports.send = function (session, id) {
    // Accepts a string of arbitrary length. All of the usual colour codes
    // ("@ora@", "@red@", etc.) work, as well as "%" being used as a line break.
    return function (message) {
        var packet = new Encoder(id, message.length);
        packet.addString(message);

        session.write(packet.build());
    };
};
