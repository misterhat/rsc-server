// Load each file in the directory as a packet sender and return a map in the
// format of ` { name: sender } `. `name` being the name we choose in the file
// and `sender` being the function to assemble the packet. The `builder`
// function accepts at least one argument, being `session`.

var fs = require('fs'),
    path = require('path'),

    // The JSON file mapping names to opcodes.
    packets = require('./packets.json'),

    senders = {};

fs.readdirSync(__dirname).forEach(function (file) {
    var sender;

    if (file === path.basename(__filename) || !/\.js$/.test(file)) {
        return;
    }

    sender = require(__dirname + '/' + file);


    if (packets.hasOwnProperty(sender.name)) {
        senders[sender.name] = sender.send;
    }
});

module.exports = function (session) {
    var send = {};

    Object.keys(senders).forEach(function (name) {
        var sender = senders[name];

        send[name] = sender(session, packets[name]);
    });

    return send;
};
