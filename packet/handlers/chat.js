// Handles whenever a client sends us a chat message.

module.exports.name = 'chat';

module.exports.handle = function (session, payload, done) {
    var player = session.player;

    player.emit('chat', {
        message: payload,
        sender: player
    });

    done(null);
};
