var PSON = require("../PSON.js");

module.exports = {

    "T": function(test) {
        var pson = new PSON.StaticPair();
        test.equal(pson.encode(null).compact().toHex(), "<F0>");
        test.equal(pson.encode(true).compact().toHex(), "<F1>");
        test.equal(pson.encode(false).compact().toHex(), "<F2>");
        test.equal(pson.encode({}).compact().toHex(), "<F3>");
        test.equal(pson.encode([]).compact().toHex(), "<F4>");
        test.equal(pson.encode("").compact().toHex(), "<F5>");
        test.done();
    },
    
    "number": function(test) {
        var pson = new PSON.StaticPair();
        test.equal(pson.encode(0).compact().toHex(), "<00>");
        test.equal(pson.encode(-120).compact().toHex(), "<EF>");
        test.equal(pson.encode(120).compact().toHex(), "<F8 F0 01>");
        test.equal(pson.encode(0.011).compact().toHex(), "<FB BA 49 0C 02 2B 87 86 3F>");
        test.done();
    },
    
    "string": function(test) {
        var pson = new PSON.StaticPair();
        test.equal(pson.encode("abc").compact().toHex(), "<FC 03 61 62 63>");
        test.done();
    },
    
    "object": function(test) {
        var pson = new PSON.StaticPair();
        test.equal(pson.encode({"a":"b"}).compact().toHex(), "<F6 01 FC 01 61 FC 01 62>");
        test.done();
    },
    
    "array": function(test) {
        var pson = new PSON.StaticPair();
        test.equal(pson.encode([1,2,3]).compact().toHex(), "<F7 03 02 04 06>");
        test.done();
    },
    
    "decode": {
        "static": function(test) {
            var pson = new PSON.StaticPair(["hello", "time", "float", "boolean", "otherbool", "null", "obj", "what", "arr"]);
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
                "arr": [1,2,3]
            };
            var jsonLen;
            test.log("JSON: "+(jsonLen = JSON.stringify(data).length));
            var bb = pson.encode(data).compact();
            test.log("PSON: "+bb.length+" = "+(bb.length*100/jsonLen - 100).toFixed(3)+"%");
            decData = pson.decode(bb);
            test.deepEqual(data, decData);
            test.done();
        },
        
        "progressive": function(test) {
            var pson = new PSON.ProgressivePair();
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
                "arr": [1,2,3,4,5]
            };
            var jsonLen;
            test.log("JSON: "+(jsonLen = JSON.stringify(data).length));
            var bb = pson.encode(data).compact();
            test.log("PSON w/ dict: "+bb.length+" = "+(bb.length*100/jsonLen - 100).toFixed(3)+"%");
            var decData = pson.decode(bb);
            test.deepEqual(data, decData);
            bb = pson.encode(data).compact();
            test.log("PSON w/o dict: "+bb.length+" = "+(bb.length*100/jsonLen - 100).toFixed(3)+"%");
            decData = pson.decode(bb);
            test.deepEqual(data, decData);
            test.done();
        }
    }    
};
