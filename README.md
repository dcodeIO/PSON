![PSON](https://raw.github.com/dcodeIO/PSON/master/PSON.png)
====
**PSON** is a super efficient binary serialization format for JSON focused on minimal encoding size.

How does it work?
-----------------
PSON combines the best of JSON, BJSON, ProtoBuf and a bit of ZIP to achieve a superior small footprint on the network
level. Basic constants and small integer values are efficiently encoded as a single byte. Other integer values are always
encoded as variable length integers. Additionally it comes with progressive and static dictionaries to reduce data
redundancy to a minimum. In a nutshell:

* 246 single byte values
* Base 128 variable length integers (varints) as in protobuf
* 32 bit floats instead of 64 bit doubles if possible without information loss
* Progressive and static dictionaries
* Raw binary data support
* Long support

Reference implementation
------------------------
This repository contains a plain **node.js/CommonJS, RequireJS/AMD and Browser compatible** JavaScript implementation
of the [PSON specification](https://github.com/dcodeIO/PSON/blob/master/PSONspec.txt) on top of 
[ByteBuffer.js](https://github.com/dcodeIO/ByteBuffer.js) and optionally [Long.js](https://github.com/dcodeIO/Long.js):

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
* **PSON** without a dictionary: 103 bytes (about **22% smaller** than JSON)
* **PSON** with a progressive dictionary: 103 bytes for the first and 59 bytes for each subsequent message (about 
  **22% smaller** for the first and about **55% smaller** for each subsequent message than JSON.
* **PSON** with the same but static dictionary: 59 bytes for each message (about **55% smaller** than JSON)
         
```text
 F6 08 FE 00 FC 06 77 6F 72 6C 64 21 FE 01 F8 A4   ......world!....
 8B B0 99 79 FE 02 FB F6 0B 76 C3 B6 45 89 3F FE   ...y.....v..E.?.
 03 F1 FE 04 F2 FE 05 F0 FE 06 F6 01 FE 07 FC 04   ................
 74 68 61 74 FE 08 F7 03 02 04 06                  that.......
```

Another example that's also contained in the test suite is encoding our package.json, which is of course a string value
centered file, to PSON using a general purpose static dictionary:

* **JSON** stringify: 813 bytes
* **PSON** with empty dict: 760 bytes (about **6% smaller** than JSON)
* **PSON** with [static dict](https://github.com/dcodeIO/PSON/blob/master/dicts/package.json): 613 bytes (about **24% smaller** than JSON)

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
        "Long": "/path/to/Long.js", // optional
        "ByteBuffer": "/path/to/ByteBufferAB.js",
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
<script src="Long.min.js"></script>
<script src="ByteBufferAB.min.js"></script>
<script src="PSON.min.js"></script>
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
* `PSON.ProgressivePair#exclude(obj: Object)` Excludes an object's and its children's keywords from being added to the progressive
   dictionary
* `PSON.ProgressivePair#include(obj: Object)` Undoes the former

#### Static
* `new PSON.StaticPair([dictionary: Array.<string>])` constructs a new static encoder and decoder pair
  with a static (or empty) dictionary
  
Downloads
---------
* [Distributions](https://github.com/dcodeIO/PSON/tree/master/dist)
* [ZIP-Archive](https://github.com/dcodeIO/PSON/archive/master.zip)
* [Tarball](https://github.com/dcodeIO/PSON/tarball/master)
  
Documentation
-------------
* [PSON specification](https://github.com/dcodeIO/PSON/blob/master/PSONspec.txt)
* [API documentation](http://htmlpreview.github.io/?http://raw.github.com/dcodeIO/PSON/master/docs/PSON.html)

**License:** [Apache License, Version 2.0](http://opensource.org/licenses/Apache-2.0)
