// Displays the "Oh dear! You are dead..." message, sent after a player's
// hits reaches zero and they die.

var Encoder = require('../encoder');

module.exports.name = 'death';

module.exports.send = function (session, id) {
    return function () {
        session.write(new Encoder(id).build());
    };
};
