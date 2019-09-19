// Sends the appearance interface to the player. This usually occurs upon
// initial log in or by speaking to the "Make over mage" NPC.

var Encoder = require('../encoder');

module.exports.name = 'appearance';

module.exports.send = function (session, id) {
    return function () {
        session.write(new Encoder(id).build());
    };
};
