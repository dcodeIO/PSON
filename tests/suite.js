var PSON = require("../PSON.js"),
    ByteBuffer = require("bytebuffer"),
    Long = ByteBuffer.Long,
    pkg = require("../package.json"),
    pkgDict = require("../dicts/package.json");

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
        var pson = new PSON.StaticPair(), bb;
        test.equal(pson.encode(0).compact().toHex(), "<00>");
        test.equal(pson.encode(-120).compact().toHex(), "<EF>");
        test.equal((bb=pson.encode(120).compact()).toHex(), "<F8 F0 01>");
        test.strictEqual(bb.LE().readZigZagVarint32(1).value, 120);
        test.equal((bb=pson.encode(0.25).compact()).toHex(), "<FA 00 00 80 3E>");
        test.strictEqual(bb.LE().readFloat32(1), 0.25);
        test.equal((bb=pson.encode(0.011).compact()).toHex(), "<FB BA 49 0C 02 2B 87 86 3F>");
        test.strictEqual(bb.LE().readFloat64(1), 0.011);
        var l = new Long.fromNumber(1);
        test.equal((bb=pson.encode(l).compact()).toHex(), "<F9 02>");
        test.ok(l.equals(bb.readZigZagVarint64(1).value));
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
        test.equal(pson.encode({"a":"b","c":"d"}).compact().toHex(), "<F6 02 FC 01 61 FC 01 62 FC 01 63 FC 01 64>");
        test.done();
    },
    
    "array": function(test) {
        var pson = new PSON.StaticPair();
        test.equal(pson.encode([1,2,3]).compact().toHex(), "<F7 03 02 04 06>");
        test.done();
    },

    "buffer": function(test) {
    	var pson = new PSON.StaticPair();
    	var buf = new Buffer(4);
    	buf.writeInt32LE(-1, 0);
    	test.equal(pson.encode(buf).compact().toHex(), "<FF 04 FF FF FF FF>");
    	test.done();
    },
    
    "en/decode": {
        
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
            test.log("PSON static: "+bb.length+" = "+(bb.length*100/jsonLen - 100).toFixed(3)+"%");
            var decData = pson.decode(bb);
            test.deepEqual(data, decData);
            console.log(""); bb.printDebug();
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
                "arr": [1,2,3]
            };
            var jsonLen;
            test.log("JSON: "+(jsonLen = JSON.stringify(data).length));
            var bb = pson.encode(data).compact();
            test.log("PSON first: "+bb.length+" = "+(bb.length*100/jsonLen - 100).toFixed(3)+"%");
            var decData = pson.decode(bb);
            test.deepEqual(data, decData);
            bb = pson.encode(data).compact();
            test.log("PSON again: "+bb.length+" = "+(bb.length*100/jsonLen - 100).toFixed(3)+"%");
            decData = pson.decode(bb);
            console.log(""); bb.printDebug();
            test.deepEqual(data, decData);
            test.done();
        }
    },
    
    "package": function(test) {
        var jsonLen;
        test.log("JSON: "+(jsonLen=JSON.stringify(pkg).length));
        var pson = new PSON.StaticPair();
        var bb = pson.encode(pkg).compact();
        test.log("PSON w/o dict: "+bb.length+" = "+(bb.length*100/jsonLen - 100).toFixed(3)+"%");
        pson = new PSON.StaticPair(pkgDict);
        bb = pson.encode(pkg).compact();
        test.log("PSON w/  dict: "+bb.length+" = "+(bb.length*100/jsonLen - 100).toFixed(3)+"%");
        console.log(""); bb.printDebug();
        test.deepEqual(pkg, pson.decode(bb));
        test.done();
    }
};
