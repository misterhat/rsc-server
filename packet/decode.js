// Decode a packet the client sent into an opcode and a payload.

module.exports = function (buffer) {
    var position = 0,

        length,

        id, payload;

    length = buffer[position++];

    if (length >= 160) {
        length = (length - 160) * 256 + buffer[position++];
    }

    payload = new Buffer(length);

    if (length >= 160) {
        buffer.copy(payload, 0, position);
    } else {
        payload[length - 1] = buffer[position++];

        if (length > 1) {
            buffer.copy(payload, 0, position, position + length - 1);
            id = payload[0];
            payload = payload.slice(1);
        } else {
            id = payload[0];
            payload = null;
        }
    }

    return {
        id: id,
        payload: payload
    };
};
