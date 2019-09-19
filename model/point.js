function Point(x, y) {
    this.x = x;
    this.y = y;
}

// Used to calculate a direction based on a change in coordinates. RSC gets
// directions in a counter-clockwise order (0=north, 1=northwest, 2=west, etc.).
Point.DIRECTIONS = [
    [3, 2, 1],
    [4, null, 0],
    [5, 6, 7],
];

// The default "near by" distance.
Point.NEAR_BY = 15;

// Calculate this point's offset from another.
Point.prototype.offsets = function (point) {
    var offsets = {};

    offsets.x = point.x - this.x || 32;
    offsets.y = point.y - this.y || 32;

    return offsets;
};

// Calculate if this position is near enough to another point.
Point.prototype.nearBy = function (point) {
    var distance = Math.sqrt(
            Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2)
        );

    return distance <= Point.NEAR_BY;
};

// Calculate what direction this point is facing now given a previous point or
// old X, Y coordinates.
Point.prototype.direction = function (x, y) {
    var oldX, oldY, deltaX, deltaY;

    if (typeof y === 'undefined') {
        oldX = x.x;
        oldY = x.y;
    } else {
        oldX = x;
        oldY = y;
    }

    deltaX = oldX - this.x;
    deltaY = oldY - this.y;

    return Point.DIRECTIONS[deltaX + 1][deltaY + 1];
};

module.exports = Point;
