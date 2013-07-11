PSON - The bastard child of ProtoBuf and JSON
=============================================
You **love** JSON for its simplicity but **hate** it for its network overhead?
You **love** ProtoBuf for its small packet size but **hate** it for its complexity?

*Can't there be solely love?*

Yes it can!
-----------
PSON is a binary serialization format built on the simplicity of JSON and the encoding capabilities of ProtoBuf.

Usage
-----
`npm install pson`

```js
var PSON = require("pson");
var initialDictionary = {...};
var pson = new PSON(initialDictionary);
...
```

Example
-------
```js
// Sender
var initialDictionary = {...};
var pson = new PSON(initialDictionary);
var data = { "hello": "world!" };
var buffer = pson.encode(data);
someSocket.send(buffer);
```

```js
// Receiver
var pson = new PSON();
someSocket.on("data", function(data) {
    data = pson.decode(data);
    ...
});
```

Behind the love
---------------
The idea behind PSON is to keep a common dictionary containing keys to integer mappings on both ends. This is similar to
how ZIP archives work. The dictionary allows us to shorten any keywords to be represented by a single byte (in an optimal
case). As a result the exact string representing a keyword needs to be submitted only once, making each subsequent
message considerably smaller - in theory. Additionally, ProtoBuf's varint encoding is great for submitting
numeric values - in practice - and the `initialDictionary` parameter even allows to start off with arbitrary string
values (for keys _and_ values).

**Note:** I just started working on this and I have no idea if this is a great idea or just another waste of time.
However, if you are interested in the topic, feel free to try it out, make contact or even to run some benchmarks.

**License:** [Apache License, Version 2.0](http://opensource.org/licenses/Apache-2.0)
