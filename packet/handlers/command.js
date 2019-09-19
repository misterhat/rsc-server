// Handles "::<command>" commands. There weren't any commands that players could
// use in real RSC, but presumably they were added for administrator use.

// For now they make it pretty simple for debugging functionality.

module.exports.name = 'command';

module.exports.handle = function (session, payload, done) {
    var player = session.player,

        args, command;

    // The command payload is a string of what was on the chat message. So if
    // we split by spaces, we can get the command name as the first element and
    // the args as the remainder.
    payload = payload.toString().split(' ');

    command = payload.shift();
    args = payload.length ? payload : [];

    switch (command) {
        case 'alert':
            session.send.alert(args.join(' '));
            break;
        case 'options':
            session.send.options(['test', 'test2']);
            break;
        case 't':
            //player.sprites[0] = +args[0];
            player.sprites[0] = 1;
            player.sprites[1] = 2;
            player.sprites[2] = +args[0];
            player.setAppearance();
            break;
        case 'sound':
            session.send.sound(args[0] || 'foundgem');
            break;
        case 'appearance':
            session.send.appearance();
            break;
        case 'c':
            session.send.message(player.position.x + ',' + player.position.y);
            break;
        case 'd':
            player.direction = +args[0];
            break;
        case 'death':
            session.send.death();
            break;
        default:
            session.send.message('no handler for command ' + command);
            break;
    }

    //player.emit('command', command, args);

    done(null);
};
