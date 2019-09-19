// Load each of the files in this directory as a packet handler and return a map
// in the format of ` { id: handler } `. `id` being the opcode the client sends,
// mapped in `packets.json`, and `handler` being the function used to deal with
// it. The `handler` function accepts three parameters, `session`, `payload`
// and `done`.

var fs = require('fs'),
    path = require('path'),

    // The JSON file mapping names to opcodes.
    packets = require('./packets.json'),

    handlers = {};

fs.readdirSync(__dirname).forEach(function (file) {
    var handler;

    if (file === path.basename(__filename) || !/\.js$/.test(file)) {
        return;
    }

    handler = require(__dirname + '/' + file);

    if (packets.hasOwnProperty(handler.name)) {
        handlers[packets[handler.name]] = handler.handle;
    }
});

module.exports = handlers;
