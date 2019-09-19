# rsc-server
A dynamic, event-driven RuneScape Classic server written in JavaScript. Designed
to work with the 204 client revision (although can be easily modified to work
with most others).

**NOTE** I've currently disabled RSA and ISAAC within the client for the time
being.

## Installation
With `npm`:

    $ npm install rsc-server

Or alternatively, with `git`:

    $ git clone https://github.com/misterhat/rsc-server.git
    $ cd rsc-server
    $ npm install

## Running
    $ node run.js

## Packets
### Handlers
Packet handlers used to handle the incoming data receieved from the client.
In *rsc.js*, they're handled dynamically. Packet IDs are defined in
`./packets/handlers/packets.json` in the format ` "name": id `. This allows for
very easy packet ID modification without hardcoding magic numbers. In order to
actually add functionality, a file must be created within `./packets/handlers`
with the following structure:

```javascript
module.exports.name = 'name';

module.exports.handle = function (session, payload, done) {};
```

The exported `name` should match the name in `packets.json`. In `handle`,
`session` is the session object that sent the packet, and `payload` is the
`Buffer` of data. `done` is to be called either once the packet is handled or
there's an error in `payload` (as per the Node.JS callback convention).

### Senders
Packet senders are used to send data from the server to the client. Much like
packet handlers, they're also handled dynamically. These packet IDs, are stored
in `./packets/senders/packets.json` and follow the same format as the packet
handlers. The functionality, however, is achieved with the structure:

```javascript
module.exports.name = 'message';

module.exports.send = function (session, id) {
    return function (args) {}
};
```

As with handlers, the exported `name` is paired with the name in `packets.json`.
In `send`, the top-layered function is invoked once per session
inititialization, giving the nested function a session and ID to work with.
The nested function are later accumulated and turned into a map of the format:

```javascript
{
    name: function (args) {}
}
```

This map is associated with each session object, and attached to the property
`send`. This allows for the following method of invoking senders:

```javascript
sesssion.send.message('Welcome to RuneScape!');
```

Take a look in `./packet/senders` for more examples on how senders are
structured and built.

## License
AGPL-3.0+
