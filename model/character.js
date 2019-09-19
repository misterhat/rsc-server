var util = require('util'),

    Entity = require('./entity');

function Character() {
    Entity.call(this);
}

util.inherits(Character, Entity);

module.exports = Character;
