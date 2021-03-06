var SmartBuffer = require('smart-buffer');

module.exports.name = 'walk';

// This function solves basic paths that the client expects us to do. It can
// move in straight lines (that is, if X or Y is being incremented alone), or
// perfect diagonals (X and Y both being incremented the same amount). It
// produces "instructions" for the client to follow as an array of deltas.

// For example, to solve (0, 3) -> (0, 6) this function would produce:
// ` [ { x: 0, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 1} ] `

// Or to solve (0, 0) -> (3, 3):
// ` [ { x: 1, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 1 } ] `

// It would *not* solve (0, 0) -> (5, 8) for instance.
function createSteps(startX, startY, endX, endY) {
        // The total amount of steps we'll need to take to reach our goal.
    var totalSteps = Math.abs(endX - startX) + Math.abs(endY - startY),

        // How many steps we've taken so far.
        currentSteps = 0,

        // The positions we need to move to reach our goal.
        steps = [],

        // Check if we're moving backwards or forwards.
        deltaX = startX < endX ? 1 : -1,
        deltaY = startY < endY ? 1 : -1;

    // Check if this is a perfectly diagonal path.
    if (Math.abs(endX - startX) !== Math.abs(endY - startY)) {
        // We're moving in the X direction, so don't change Y.
        if ((endX - startX) !== 0) {
            deltaY = 0;
        } else {
            deltaX = 0;
        }
    }

    while (currentSteps !== totalSteps) {
        steps.push({
            x: deltaX,
            y: deltaY
        });

        currentSteps += Math.abs(deltaX) + Math.abs(deltaY);
    }

    return steps;
}

module.exports.handle = function (session, payload, done) {
    var player = session.player,

        targetX, targetY, curX, curY, incX, incY, additionalPaths,

        i;

    payload = new SmartBuffer(payload);

    // Where the clients want our character to be to solve the relative path
    // information sent later.
    targetX = payload.readUInt16BE();
    targetY = payload.readUInt16BE();

    // Reset our walk queue if we're interuppting one.
    player.walkQueue.length = 0;

    // Where the player currently is.
    curX = player.position.x;
    curY = player.position.y;

    // Move from our current position to the target position (the position where
    // that the client sends the remaining relative positions from).
    Array.prototype.push.apply(
        player.walkQueue,
        createSteps(curX, curY, targetX, targetY)
    );

    // We should now be at the location the client asked.
    curX = targetX;
    curY = targetY;

    // How many additional paths there are before reaching the destination.
    additionalPaths = payload.remaining() / 2;

    for (i = 0; i < additionalPaths; i += 1) {
        // The increments relative to the target position.
        incX = payload.readInt8();
        incY = payload.readInt8();

        Array.prototype.push.apply(
            player.walkQueue,
            createSteps(curX, curY, targetX + incX, targetY + incY)
        );

        // Update our current position.
        curX = targetX + incX;
        curY = targetY + incY;
    }

    done(null);
};
