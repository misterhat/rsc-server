// Sends a generic message to the player's chat box (eg. "Welcome to
// RuneScape!").

var Encoder = require('../encoder');

module.exports.name = 'message';

module.exports.send = function (session, id) {
    return function(message) {
        var packet = new Encoder(id, message.length);

        packet.addString(message);
        session.write(packet.build());
    };
};
