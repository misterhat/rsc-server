// handles when a player submits a design from the appearance interface.

var SmartBuffer = require('smart-buffer'),

    HEAD_SPRITES = [0, 3, 5, 6, 7];

module.exports.name = 'appearance';

module.exports.handle = function (session, payload, done) {
    var appearance = {},

        player = session.player;

    payload = new SmartBuffer(payload);

    // gender byte here is useless as body type determines it already.
    payload.skip(1);

    // player's head sprite.
    appearance.headSprite = payload.readInt8();

    if (HEAD_SPRITES.indexOf(appearance.headSprite) === -1) {
        return done(new RangeError('Invalid head type ' +
                                   appearance.headSprite));
    }

    // player's body type (either 4 for female or 1 for male).
    appearance.bodySprite = payload.readInt8();

    if (appearance.bodySprite !== 1 && appearance.bodySprite !== 4) {
        return done(new Error('Invalid body type ' + appearance.bodySprite));
    }

    // The player's leg type (always 2, so we'll skip it).
    payload.skip(1);

    // The player's hair colour (ranges from 0 - 9).
    appearance.hairColour = payload.readInt8();

    if (appearance.hairColour < 0 || appearance.hairColour > 9) {
        return done(new RangeError(
            'Invalid hair colour ' + appearance.hairColour
        ));
    }

    // The player's top colour (ranges from 0 - 14).
    appearance.topColour = payload.readInt8();

    if (appearance.topColour < 0 || appearance.topColour > 14) {
        return done(new RangeError('Invalid top colour ' +
                                   appearance.topColour));
    }

    // The player's leg colour (also ranges from 0 - 14).
    appearance.legColour = payload.readInt8();

    if (appearance.legColour < 0 || appearance.legColour > 14) {
        return done(new RangeError(
            'Invalid leg colour ' + appearance.legColour
        ));
    }

    // The player's skin colour (ranges from 0 - 4).
    appearance.skinColour = payload.readInt8();

    if (appearance.skinColour < 0 || appearance.skinColour > 4) {
        return done(new RangeError(
            'Invalid skin colour ' + appearance.skinColour
        ));
    }

    console.log(appearance);

    // There aren't any errors, update the appearance map on the player.
    player.setAppearance(appearance);

    done(null);
};
