var events = require('events'),
    net = require('net'),
    util = require('util'),

    World = require('./model/world'),
    Session = require('./session');

function Server(port) {
    // The port number to listen for connections on.
    this.port = port || 43594;

    // The world where all of the entities are held.
    this.world = new World();

    // A map to hold all of the connection sessions in. It uses the format
    // ` { identifier: session } `
    this.sessions = {};
}

util.inherits(Server, events.EventEmitter);

// Remove a session from the map.
Server.prototype.removeSession = function (identifier) {
    delete this.sessions[identifier];
};

// Start accepting requests on the specified port and create new session
// objects associated with connection sockets.
Server.prototype.listen = function (done) {
    var that = this;

    this.server = net.createServer(function (socket) {
        var session = new Session(that, socket);

        that.sessions[session.identifier] = session;
    });

    this.server.listen(this.port, done);
};

Server.prototype.start = function (done) {
    var that = this;

    this.listen(function (err) {
        if (err) {
            return done(err);
        }

        console.log('Server listening on port %d.', that.port);
        done();
    });
};

module.exports = Server;
