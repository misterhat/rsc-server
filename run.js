var Server = require('./server'),

    server = new Server();

server.start(function (err) {
    if (err) {
        return console.error(err);
    }
});
