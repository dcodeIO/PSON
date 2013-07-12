var PSON = require("../PSON.min.js"),
    assert = require("assert");

var pson = new PSON();
var data = {
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
};
var bb;

PSON.freeze(data);
bb = pson.encode(data).compact();
var nFrozen = bb.length;

PSON.unfreeze(data);
bb = pson.encode(data).compact();
var nDict = bb.length;
pson.decode(bb); // dict is now ["hello", "time", "float", "boolean", "otherbool", "null", "obj", "what", "arr"]

bb = pson.encode(data).compact();
var nAgain = bb.length;

var decData = pson.decode(bb);
assert.deepEqual(data, decData);

// console.log("Dec", pson.decoder.dict);
// console.log("Enc", pson.encoder.dict);

console.log("OK: JSON="+JSON.stringify(data).length+", PSON="+nDict+" with initial dict, "+nAgain+" subsequently ("+nFrozen+" when frozen)");

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
