![PSON](https://raw.github.com/dcodeIO/PSON/master/PSON.png)
====
You **love** JSON for its simplicity but **hate** it for its network overhead?  
You **love** ProtoBuf for its small packet size but **hate** it for its complexity?

*Can't there solely be love?*

Yes it can!
-----------
**PSON** is a binary serialization format built on the simplicity of JSON and the encoding capabilities of
[Google's Protocol Buffers](https://developers.google.com/protocol-buffers/docs/overview). This repository contains
a plain JavaScript implementation on top of [ProtoBuf.js](https://github.com/dcodeIO/ProtoBuf.js).

Usage
-----

#### node.js/CommonJS

`npm install pson`

```js
var PSON = require("pson");
var initialDictionary = {...};
var pson = new PSON(initialDictionary);
...
```

#### RequireJS/AMD

```js
require.config({
    ...
    "paths": {
        "Long": "/path/to/Long.js",
        "ByteBuffer": "/path/to/ByteBuffer.js",
        "ProtoBuf": "/path/to/ProtoBuf.js",
        "PSON": "/path/to/PSON.js"
    },
    ...
});
require(["PSON"], function(PSON) {
    ...
});
```

#### Browser

```html
<script src="//raw.github.com/dcodeIO/Long.js/master/Long.min.js"></script>
<script src="//raw.github.com/dcodeIO/ByteBuffer.js/master/ByteBuffer.min.js"></script>
<script src="//raw.github.com/dcodeIO/ProtoBuf.js/master/ProtoBuf.min.js"></script>
<script src="//raw.github.com/dcodeIO/PSON/master/PSON.min.js"></script>
```

```js
var PSON = dcodeIO.PSON;
...
```

Example
-------
```js
// Sender
var initialDictionary = [ ... ];
var pson = new PSON(initialDictionary);
var data = { "hello": "world!" };
var buffer = pson.encode(data);
someSocket.send(buffer);
```

```js
// Receiver
var initialDictionary = [ same! ];
var pson = new PSON(initialDictionary);
someSocket.on("data", function(data) {
    data = pson.decode(data);
    ...
});
```

API
---
The API is pretty much straight forward:

#### PSON
* `new PSON([initialDictionary: Array.<string>])` constructs a new combined encoder and decoder
* `PSON#encode(json: *): ByteBuffer` encodes JSON to PSON data
  * `PSON#toBuffer(json: *): Buffer` encodes straight to a node.js Buffer
  * `PSON#toArrayBuffer(json: *): ArrayBuffer` encodes straight to an ArrayBuffer
* `PSON#decode(pson: ByteBuffer|Buffer|ArrayBuffer): *` decodes PSON data to JSON
* `PSON.freeze(obj: Object)` Freezes an object, preventing its keys from being added to the dictionary when encoded
* `PSON.unfreeze(obj: Object)` Unfreezes an object, allowing its keys to be added to the dictionary again when encoded
* `PSON#encoder: PSON.Encoder` Encoder instance
* `PSON#decoder: PSON.Decoder` Decoder instance

#### PSON.Encoder
* `PSON.Encoder#freeze()`: Freezes the encoding dictionary, preventing any keys to be added (useful for static dicts)
* `PSON.Encoder#unfreeze()`: Unfreezes the encoding dictionary, allowing keys to be added again

Behind the love
---------------
The idea behind PSON is to keep a common dictionary containing keys to integer mappings on both ends. This is similar to
how ZIP archives work and trades some memory for a smaller packet size. The dictionary allows us to shorten any keywords
to be represented by a single byte (in an optimal case). As a result the exact string representing a keyword needs to be
transmitted only once, making each subsequent message considerably smaller - in theory. Additionally, ProtoBuf's varint
encoding is great for submitting numeric values - in practice - and the `initialDictionary` parameter even allows to
start off with arbitrary string values (for keys _and_ values). Therefore, an ideal use case for PSON is to use it as
a drop-in replacement for an existing mostly static JSON protocol.

Comparison
----------
As of today there is a minimalistic test case for the following data:

```json
{
    "hello": "world!",
    "time": 1234567890,
    "float": 0.011,
    "boolean": true,
    "otherbool": false,
    "null": null,
    "obj": {
        "what": "that"
    },
    "arr": [1,2,3]
}
```

which is

* **131 bytes** large after `JSON.stringify`
* **151 bytes** after the first `PSON#encode` including the dictionary and
* **78 bytes** after each subsequent `PSON#encode`

which is, in this case, from the second message onwards about **40% smaller than JSON**, or

* **122 bytes** after each `PSON#encode` if the data object has been frozen through `PSON.freeze` (disabled the
  dictionary for this object)
  
which is, in this case and without any compression attempts, still about **7% smaller than JSON**.

Documentation
-------------
* [Fully documented source code](https://github.com/dcodeIO/PSON/tree/master/src)
* The [PSON.proto](https://github.com/dcodeIO/PSON/blob/master/src/PSON.proto) is also freely available and it should
  be quite easy to implement the protocol in a variety of programming languages using your favourite
  [protobuf library](http://code.google.com/p/protobuf/wiki/ThirdPartyAddOns).
* [Background reading](https://github.com/dcodeIO/ProtoBuf.js/wiki/ProtoBuf.js-vs-JSON)

**Note:** I just started working on this and I am not yet sure if this is a great idea or just another waste of time.
However, if you are interested in the topic, feel free to try it out, make contact or even to run some benchmarks.

**License:** [Apache License, Version 2.0](http://opensource.org/licenses/Apache-2.0)
