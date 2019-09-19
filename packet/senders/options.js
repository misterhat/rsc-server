// Send an options menu to the player. These are usually encountered after
// talking to an NPC.

var Encoder = require('../encoder');

module.exports.name = 'options';

module.exports.send = function (session, id) {
    return function (options) {
        var packet = new Encoder(id);

        packet.addByte(options.length);

        options.forEach(function (option) {
            packet.addByte(option.length);
            packet.addString(option);
        });

        session.write(packet.build());
    };
};
