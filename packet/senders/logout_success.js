// Sent to the client if they've successfuly logged out (won't be sent if they
// attempt to log out during combat for example).

var Encoder = require('../encoder');

module.exports.name = 'logoutSuccess';

module.exports.send = function (session, id) {
    return function () {
        session.write(new Encoder(id).build());
    };
};
