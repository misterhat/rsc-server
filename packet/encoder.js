// `Encoder` will encode arbitrary data into RSC packets.

// The constructor takes two parameters, `id and `size`. The `id` parameter
// is mandatory and dictates the final opcode sent to the client in the header.
// The `size` parameters is optional. If present, it will generate a `Buffer` of
// a static size for the payload. Otherwise, an array is used. Enter a size when
// the length of the packet is consistent.

// The bitmasks used to encode bits into the packet.
var bitmasks = [
    0, 0x1, 0x3, 0x7, 0xf, 0x1f, 0x3f, 0x7f,
    0xff, 0x1ff, 0x3ff, 0x7ff, 0xfff, 0x1fff,
    0x3fff, 0x7fff, 0xffff, 0x1ffff, 0x3ffff,
    0x7ffff, 0xfffff, 0x1fffff, 0x3fffff, 0x7fffff,
    0xffffff, 0x1ffffff, 0x3ffffff, 0x7ffffff,
    0xfffffff, 0x1fffffff, 0x3fffffff, 0x7fffffff, -1
];

function Encoder(id, size) {
    this.id = id;

    this.static = !!size;
    this.bitCaret = 0;

    if (this.static) {
        this.payload = new Buffer(size);
        this.caret = 0;
    } else {
        this.payload = [];
    }

    return this;
}

Encoder.prototype.addByte = function (byte) {
    if (this.static) {
        this.payload.writeUInt8(byte & 0xff, this.caret);
        this.caret += 1;
    } else {
        this.payload.push(byte);
    }

    return this;
};

Encoder.prototype.addShort = function (short) {
    if (this.static) {
        this.payload.writeUInt16BE(short & 0xffff, this.caret);
        this.caret += 2;
    } else {
        this.payload.push(
            short >> 8,
            short & 0xff
        );
    }

    return this;
};

Encoder.prototype.addInt = function (int) {
    if (this.static) {
        this.payload.writeUInt32BE(int & 0xffffffff, this.caret);
        this.caret += 4;
    } else {
        this.payload.push(
            int >> 24,
            int >> 16,
            int >> 8,
            int & 0xff
        );
    }

    return this;
};

Encoder.prototype.addLong = function (long) {
    this.addInt(long.shiftRight(32).toInt());
    this.addInt(long.toInt());

    return this;
};

Encoder.prototype.addString = function (string) {
    var i;

    if (this.static) {
        this.payload.write(string, this.caret);
        this.caret += string.length;
    } else {
        for (i = 0; i < string.length; i += 1) {
            this.payload.push(string.charCodeAt(i));
        }
    }

    return this;
};

Encoder.prototype.addBytes = function (bytes) {
    var i;

    for (i = 0; i < bytes.length; i += 1) {
        this.addByte(bytes[i]);
    }

    return this;
};

Encoder.prototype.addBits = function (value, bits) {
    var byteCaret = this.bitCaret >> 3,
        bitOffset = 8 - (this.bitCaret & 7);

    this.bitCaret += bits;

    for (; bits > bitOffset; bitOffset = 8) {
        this.payload[byteCaret] &= ~bitmasks[bitOffset];
        this.payload[byteCaret++] |=
            (value >> (bits - bitOffset)) & bitmasks[bitOffset];

        bits -= bitOffset;
    }

    if (bits === bitOffset) {
        this.payload[byteCaret] &= ~bitmasks[bitOffset];
        this.payload[byteCaret] |= value & bitmasks[bitOffset];
    } else {
        this.payload[byteCaret] &= ~(bitmasks[bits] << (bitOffset - bits));
        this.payload[byteCaret] |=
            (value & bitmasks[bits]) << (bitOffset - bits);
    }

    if (this.static) {
        this.caret = byteCaret;
    }

    return this;
};

// Build the final buffer with a header to send to the client.
Encoder.prototype.build = function () {
    var length = this.payload.length,

        header = new Buffer(3);

    header.fill(0);

    // If the packet was being dynamically sized, turn it into a static buffer
    // now so the rest of the operations are consistent.
    if (!this.static) {
        this.payload = new Buffer(this.payload);
    }

    if (length >= 160) {
        header[0] = 160 + ((length + 1) / 256);
        header[1] = (length + 1) & 0xff;
        header[2] = this.id;

        return Buffer.concat([header, this.payload], 3 + length);
    } else {
        header[0] = length + 1;

        if (length > 0) {
            header[1] = this.payload[length - 1];
            header[2] = this.id;

            return Buffer.concat(
                [header, this.payload.slice(0, length - 1)],
                3 + length - 1
            );
        } else {
            header[1] = this.id;
            return header;
        }
    }
};

module.exports = Encoder;
