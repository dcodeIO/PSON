var PSON = require("../PSON.js"),
    assert = require("assert");

var pson = new PSON();
var data = {
    "hello": "world!",
    "time": 1234567890,
    "float": 0.01234,
    "boolean": true,
    "otherbool": false,
    "null": null,
    "obj": {
        "what": "that"
    },
    "arr": [1,2,3/*,undefined*/]
};
var bb;

var json = JSON.stringify(data);
console.log("JSON: "+json+" ("+json.length+")\n");
assert.deepEqual(JSON.parse(json), data); // will throw if undefined is used as JSON cannot handle this (PSON can)

PSON.freeze(data);
bb = pson.encode(data).compact();
var nFrozen = bb.length;
console.log("FROZEN:"); bb.printDebug();

PSON.unfreeze(data);
bb = pson.encode(data).compact();
var nDict = bb.length;
console.log("WITH INITIAL DICT:"); bb.printDebug();
pson.decode(bb);

bb = pson.encode(data).compact();
var nAgain = bb.length;
console.log("AGAIN USING DICT:"); bb.printDebug();

var decData = pson.decode(bb);
try {
    assert.deepEqual(data, decData);
} catch (e) {
    console.log(data, decData);
    throw(e);
}

// console.log("Dec", pson.decoder.dict);
// console.log("Enc", pson.encoder.dict);

console.log("OK");

/**
 12 id=2 (data), wt=2
 18 len=24
 1A id=3 (object), wt=2
 16 len=22
 0A id=1 (refs), wt=2
 02 len=2 packed
 00 > =0
 01 > =1
 12 id=2 (values), wt=2
 10 len=16 packed
 00 len=0 > =null ???
 0E len=14
 1A id=3 (object), wt=2
 0C len=12
 0A id=1 (refs), wt=2
 01 len=1
 02 > =2
 12 id=2 (values), wt=2
 07 len=7
 06 len=6
 2A id=5 (string), wt=2
 04 len=4
 64 ...
 61 ...
 74 ...
 61 > =data
 */
