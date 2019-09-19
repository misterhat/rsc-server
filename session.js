var crypto = require('crypto'),

    handlers = require('./packet/handlers'),
    senders = require('./packet/senders'),

    decode = require('./packet/decode');

function Session(server, socket) {
    this.server = server;
    this.socket = socket;

    this.updateIdentifier();
    this.socket.setTimeout(60000);

    // Apply all of the packet senders.
    this.send = senders(this);

    this.listen();
}

// Sends a raw buffer to the client.
Session.prototype.write = function (buffer, done) {
    this.socket.write(buffer, done);
};

// Remove the session from the list within the server instance and destroy the
// socket so no further activity takes place.
Session.prototype.close = function () {
    this.socket.destroy();
    this.server.removeSession(this.identifier);
};

// Generate a unique identifier to identify this session with. What's used is
// farily arbitrary as long as it's unique.
Session.prototype.updateIdentifier = function () {
    var sha = crypto.createHash('sha1');
    sha.update(this.socket.remoteAddress + Date.now());

    this.identifier = sha.digest('hex');
};

// Add event listeners to the associated socket.
Session.prototype.listen = function () {
    var that = this;

    this.socket.on('data', function (data) {
        var decoded = decode(data);

        // TODO something to check whether or not the player is logged in
        // for all of the handlers besides session and login.

        // The client sent us a packet that we don't have a handler for yet (or
        // one that doesn't exist).
        if (!handlers.hasOwnProperty(decoded.id)) {
            console.warn(that.toString(), new Error(
                'No handler for packet ID ' + decoded.id
            ));
            return;
        }

        handlers[decoded.id](that, decoded.payload, function (err) {
            // The session triggered an error to be caused in the handler.
            if (err) {
                if (that.player) {
                    that.player.destroy();
                }

                that.close();
                console.error(that.toString(), err);
            }
        });
    });

    this.socket.on('error', function (err) {
        console.error(that.toString(), err);
    });
};

Session.prototype.toString = function () {
    return '[Session ' +
        this.identifier + ' ' + this.socket.remoteAddress + ']';
};

module.exports = Session;
