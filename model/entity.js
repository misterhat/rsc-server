var util = require('util'),
    events = require('events');

function Entity() {
    events.EventEmitter.call(this);
}

util.inherits(Entity, events.EventEmitter);

module.exports = Entity;
