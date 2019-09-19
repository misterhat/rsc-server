// The session packet is sent once the client connects. It sends a single byte
// calculated from the username encoding.

// After it's sent, calculate two secure integers that the client sends back
// later.

module.exports.name = 'session';

function secureInt() {
    return ~~(Math.random() * 0xffffffff);
}

module.exports.handle = function (session, payload, done) {
    var packet = new Buffer(8);

    session.keys = [secureInt(), secureInt()];

    packet.writeInt32BE(session.keys[0], 0);
    packet.writeInt32BE(session.keys[1], 4);

    session.write(packet);

    done(null);
};
