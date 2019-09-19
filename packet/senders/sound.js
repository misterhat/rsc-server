// Tells the client to play a sound file. Sounds are members-only, so they
// aren't loaded when the client is in free-to-play mode.

var Encoder = require('../encoder');

module.exports.name = 'sound';

module.exports.send = function (session, id) {
    return function (name) {
        var packet = new Encoder(id, name.length);

        packet.addString(name);

        session.write(packet.build());
    };
};
