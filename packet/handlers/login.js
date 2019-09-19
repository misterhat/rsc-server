// After the session packet is sent, the client sends a login packet with their
// log-in information attached. This includes version, whether or not it's
// reconnecting, username and password. In return it accepts a single byte
// indicating the status of the login.

var SmartBuffer = require('smart-buffer'),

    Player = require('../../model/player'),

    // The status codes the client associates after login.
    loginCodes = {
        // A successful player.
        SUCCESS: 0,

        // A successful moderator login.
        SUCCESS_MOD: 25,

        // Sent after a reconnecting login to indicate success.
        SUCCESS_RECONNECT: 1,

        // Invalid username or password.
        INVALID_CREDENTIALS: 3,

        // Sent if the server encounters an error.
        MISC_ERROR: 5
    };

module.exports.name = 'login';

module.exports.handle = function (session, payload, done) {
    var keys = [],

        reconnecting, version, username, password,

        i;

    payload = new SmartBuffer(payload);

    // Whether or not the client is reconnecting from a disconnect.
    reconnecting = !!payload.readInt8();

    // The version of the client connecting.
    version = payload.readInt16BE();

    // After the version there're two useless bytes we can skip over. The first
    // tells us whether or not the client is connecting from an applet and the
    // second appears to be useless (it's always 10).
    payload.skip(2);

    for (i = 0; i < 4; i += 1) {
        keys.push(payload.readInt32BE());
    }

    // The UUID isn't useful either as it's always 0 for the time being.
    payload.skip(4);

    // This check is absolutely necessary.
    if (session.keys[0] !== keys[2] || session.keys[1] !== keys[3]) {
        session.write(new Buffer([loginCodes.MISC_ERROR]));
        session.server.removeSession(session.identifier);

        return done(null);
    }

    username = payload.readString(20).trim();
    password = payload.readString(20).trim();

    session.player = new Player(session, username);

    //session.write(new Buffer([loginCodes.SUCCESS]));
    session.write(new Buffer([loginCodes.SUCCESS_MOD]));
    session.player.login();

    done(null);
};
