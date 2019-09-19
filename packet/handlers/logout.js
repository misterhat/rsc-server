// This packet is sent whenever a player clicks the logout button on the options
// menu.

module.exports.name = 'logout';

module.exports.handle = function (session, payload, done) {
    var player = session.player;

    // TODO check if they're busy or in combat etc.

    console.log('logging out');

    player.logout();
    done(null);
};
