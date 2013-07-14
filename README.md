![PSON](https://raw.github.com/dcodeIO/PSON/master/PSON.png)
====
**PSON** is a super efficient binary serialization format for JSON. It outperforms JSON, BSON, BJSON, Smile and, if used
wisely, even protobuf and thrift in encoding size!

How does it work?
-----------------
PSON combines the best of BJSON, ProtoBuf and ZIP to achieve a superior small footprint on the network level. Basic
constants like `null`, `true` and `false` and small integer values are efficiently encoded as a single byte while
integer values are always stored as varints like known from protobuf. Additionally it comes with progressive and static
dictionaries to reduce data redundancy to a minimum. In a nutshell:

* 256 one-byte values
* Base 128 variable length integers (varints) from protobuf
* 32bit floats if possible without precision loss
* Progressive and static dictionaries
* Raw binary data support through [ByteBuffer.js](https://github.com/dcodeIO/ByteBuffer.js)
* Long support through [Long.js](https://github.com/dcodeIO/Long.js)

A **PSON.StaticPair** contains the PSON encoder and decoder for a static (or empty) dictionary and can be shared between
all connections. It's recommended for production.

A **PSON.ProgressivePair** contains the PSON encoder and decoder for a progressive (automatically filling) dictionary.
On the one hand this requires no dictionary work from the developer but on the other requires one pair per connection.

tl;dr Numbers, please!
----------------------
The test suite contains the following basic example message:

```json
{
    "hello": "world!",
    "time": 1234567890,
    "float": 0.01234,
    "boolean": true,
    "otherbool": false,
    "null": null,
    "obj": {
        "what": "that"
    },
    "arr": [1,2,3]
}
```

* **JSON** stringify: 133 bytes
* **PSON** without a dictionary: 103 bytes (about **23% smaller** than JSON)
* **PSON** with a progressive dictionary: 103 bytes for the first and 59 bytes for each subsequent message (about 
  **22% smaller** for the first and about **55% smaller** for each subsequent message than JSON.
* **PSON** with the same but static dictionary: 59 bytes for each message (about **55% smaller** than JSON)           

Usage
-----

#### node.js/CommonJS

`npm install pson`

```js
var PSON = require("pson");
...
```

#### RequireJS/AMD

```js
require.config({
    ...
    "paths": {
        "Long": "/path/to/Long.js",
        "ByteBuffer": "/path/to/ByteBuffer.js",
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
var initialDictionary = ["hello"];
var pson = new PSON.ProgressivePair(initialDictionary);
var data = { "hello": "world!" };
var buffer = pson.encode(data);
someSocket.send(buffer);
```

```js
// Receiver
var initialDictionary = ["hello"];
var pson = new PSON.ProgressivePair(initialDictionary);
someSocket.on("data", function(data) {
    data = pson.decode(data);
    ...
});
```

API
---
The API is pretty much straight forward:

* `PSON.Pair#encode(json: *): ByteBuffer` encodes JSON to PSON data
  * `PSON.Pair#toBuffer(json: *): Buffer` encodes straight to a node.js Buffer
  * `PSON.Pair#toArrayBuffer(json: *): ArrayBuffer` encodes straight to an ArrayBuffer
* `PSON.Pair#decode(pson: ByteBuffer|Buffer|ArrayBuffer): *` decodes PSON data to JSON

#### Progressive
* `new PSON.ProgressivePair([initialDictionary: Array.<string>])` constructs a new progressive encoder and decoder pair
  with an automatically filling keyword dictionary
* `ProgressivePair#exclude(obj: Object)` Excludes an object's and its children's keywords from being added to the progressive
   dictionary
* `ProgressivePair#include(obj: Object)` Undoes the former

#### Static
* `new PSON.StaticPair([dictionary: Array.<string>])` constructs a new static encoder and decoder pair
  with a static (or empty) dictionary
  
Documentation
-------------
* [PSON specification](https://github.com/dcodeIO/PSON/blob/master/PSONspec.txt)
* [API documentation](http://htmlpreview.github.io/?http://raw.github.com/dcodeIO/PSON/master/docs/PSON.html)

**Note:** I just started working on this, so there might still be some bugs. Let me know by creating an issue!
PSON >=0.5 is also no longer based on protobuf but uses its own
[encoding format](https://github.com/dcodeIO/PSON/blog/master/PSONspec.txt).

**License:** [Apache License, Version 2.0](http://opensource.org/licenses/Apache-2.0)
