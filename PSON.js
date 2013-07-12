/*
 Copyright 2013 Daniel Wirtz <dcode@dcode.io>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * @license PSON (c) 2013 Daniel Wirtz <dcode@dcode.io>
 * Released under the Apache License, Version 2.0
 * see: https://github.com/dcodeIO/PSON for details
 */
(function(global) {
    "use strict";
    
    function loadPSON(ProtoBuf) {
        if (!ProtoBuf) {
            throw(new Error("PSON requires ProtoBuf.js: Get it at https://github.com/dcodeIO/ProtoBuf.js"));
        }

        /**
         * Constructs a new combined PSON encoder and decoder.
         * @param {Array.<string>=} values Initial dictionary values
         * @constructor
         */
        var PSON = function(values) {
    
            /**
             * PSON encoder.
             * @type {PSON.Encoder}
             */
            this.encoder = new PSON.Encoder(values);
    
            /**
             * PSON decoder.
             * @type {PSON.Decoder}
             */
            this.decoder = new PSON.Decoder(values);
        };

        /**
         * Freezes an object, preventing its keys from being added to the dictionary when encoded.
         * @param {Object} obj
         */
        PSON.freeze = function(obj) {
            if (typeof obj === 'object') {
                Object.defineProperty(obj, "_PSON_FROZEN_", {
                    value: true,
                    enumerable: false,
                    configurable: true
                });
            }
        };

        /**
         * Unfreezes an object, allowing its keys being added to the dictionary again when encoded.
         * @param {Object} obj
         */
        PSON.unfreeze = function(obj) {
            if (typeof obj === 'object') {
                delete obj["_PSON_FROZEN_"];
            }
        };
    
        var proto = ProtoBuf.newBuilder()["import"](
            {
                "package": "PSON",
                "messages": [
                    {
                        "name": "Message",
                        "fields": [
                            {
                                "rule": "repeated",
                                "type": "Value",
                                "name": "dict",
                                "id": 1,
                                "options": {
                                    "packed": "true"
                                }
                            },
                            {
                                "rule": "required",
                                "type": "Value",
                                "name": "data",
                                "id": 2,
                                "options": {}
                            }
                        ],
                        "enums": [],
                        "messages": [],
                        "options": {}
                    },
                    {
                        "name": "Value",
                        "fields": [
                            {
                                "rule": "optional",
                                "type": "uint32",
                                "name": "ref",
                                "id": 1,
                                "options": {}
                            },
                            {
                                "rule": "optional",
                                "type": "bool",
                                "name": "udf",
                                "id": 2,
                                "options": {}
                            },
                            {
                                "rule": "optional",
                                "type": "Object",
                                "name": "obj",
                                "id": 3,
                                "options": {}
                            },
                            {
                                "rule": "optional",
                                "type": "Array",
                                "name": "arr",
                                "id": 4,
                                "options": {}
                            },
                            {
                                "rule": "optional",
                                "type": "string",
                                "name": "str",
                                "id": 5,
                                "options": {}
                            },
                            {
                                "rule": "optional",
                                "type": "int32",
                                "name": "itg",
                                "id": 6,
                                "options": {}
                            },
                            {
                                "rule": "optional",
                                "type": "float",
                                "name": "flt",
                                "id": 7,
                                "options": {}
                            },
                            {
                                "rule": "optional",
                                "type": "double",
                                "name": "dbl",
                                "id": 8,
                                "options": {}
                            },
                            {
                                "rule": "optional",
                                "type": "bool",
                                "name": "bln",
                                "id": 9,
                                "options": {}
                            },
                            {
                                "rule": "optional",
                                "type": "bytes",
                                "name": "byt",
                                "id": 10,
                                "options": {}
                            }
                        ],
                        "enums": [],
                        "messages": [],
                        "options": {}
                    },
                    {
                        "name": "Object",
                        "fields": [
                            {
                                "rule": "repeated",
                                "type": "uint32",
                                "name": "ref",
                                "id": 1,
                                "options": {
                                    "packed": "true"
                                }
                            },
                            {
                                "rule": "repeated",
                                "type": "string",
                                "name": "key",
                                "id": 2,
                                "options": {
                                    "packed": "true"
                                }
                            },
                            {
                                "rule": "repeated",
                                "type": "Value",
                                "name": "val",
                                "id": 3,
                                "options": {
                                    "packed": "true"
                                }
                            }
                        ],
                        "enums": [],
                        "messages": [],
                        "options": {}
                    },
                    {
                        "name": "Array",
                        "fields": [
                            {
                                "rule": "repeated",
                                "type": "Value",
                                "name": "val",
                                "id": 1,
                                "options": {
                                    "packed": "true"
                                }
                            }
                        ],
                        "enums": [],
                        "messages": [],
                        "options": {}
                    }
                ],
                "enums": [],
                "imports": [],
                "options": {}
            }
                    ).build("PSON");
    
        /**
         * PSON message class.
         * @type {Function}
         */
        PSON.Message = proto.Message;
    
        /**
         * PSON value class.
         * @type {Function}
         */
        PSON.Value = proto.Value;
    
        /**
         * PSON array class.
         * @type {Function}
         */
        PSON.Array = proto.Array;
    
        /**
         * PSON object class.
         * @type {Function}
         */
        PSON.Object = proto.Object;
    
        /**
         * Constructs a new PSON Encoder.
         * @param {Array.<string>=} values Initial dictionary values
         * @constructor
         */
        var Encoder = function(values) {
            values = (values && Array.isArray(values)) ? values : [];
            
            /**
             * Dictionary hash.
             * @type {Object.<string,number>}
             */
            this.dict = {};
        
            /**
             * Next dictionary index.
             * @type {number}
             */
            this.next = 0;
            while (this.next < values.length) {
                this.dict[values[this.next]] = this.next++;
            }
        
            /**
             * Dictionary processing stack.
             * @type {Array.<string>}
             */
            this.stack = [];
        
            /**
             * Whether the whole dictionary has been frozen.
             * @type {boolean}
             */
            this.frozen = false;
        };
        
        /**
         * Freezes the encoding dictionary, preventing any keys to be added to it.
         */
        Encoder.prototype.freeze = function() {
            this.frozen = true;
        };
        
        /**
         * Unfreezes the encoding dictionary, allowing keys to be added to it again.
         */
        Encoder.prototype.unfreeze = function() {
            this.frozen = false;
        };
        
        /**
         * Encodes JSON to PSON.
         * @param {*} data JSON
         * @returns {ByteBuffer} PSON
         */
        Encoder.prototype.encode = function(data) {
            var value = this._encodeValue(data, this.frozen);
            var msg = new PSON.Message();
            while (this.stack.length > 0) {
                msg.dict.push(new PSON.Value( {"str": this.stack.shift()} ));
            }
            msg.data = value;
            return msg.encode();
        };
        
        /**
         * Encodes a single JSON value to PSON. If the data cannot be encoded, a NULL-value is returned.
         * @param {*} data JSON
         * @param {boolean=} frozen Whether a parent object is already frozen
         * @returns {PSON.Value} PSON value
         * @private
         */
        Encoder.prototype._encodeValue = function(data, frozen) {
            var value = new PSON.Value(), i;
            if (data !== null) {
                switch (typeof data) {
                    case 'undefined':
                        value.udf = true;
                        break;
                    case 'string':
                        if (this.dict.hasOwnProperty(data)) {
                            value.ref = this.dict[data];
                        } else {
                            value.str = data;
                        }
                        break;
                    case 'number':
                        var maybeInt = parseInt(data, 10);
                        if (data === maybeInt) {
                            value.itg = maybeInt;
                        } else {
                            value.dbl = data;
                        }
                        // TODO: float if possible without precision loss
                        break;
                    case 'object':
                        frozen = frozen || !!data["_PSON_FROZEN_"];
                        if (Array.isArray(data)) {
                            value.arr = new PSON.Array();
                            for (i=0; i<data.length; i++) {
                                value.arr.val.push(this._encodeValue(data[i], frozen));
                            }
                        } else {
                            value.obj = new PSON.Object();
                            var keys = Object.keys(data), key;
                            for (i=0; i<keys.length; i++) {
                                key = keys[i];
                                if (this.dict.hasOwnProperty(key)) { // Always use the reference if it already exists
                                    value.obj.ref.push(this.dict[key]);
                                } else {
                                    if (frozen) { // Skip dictionary if frozen
                                        value.obj.key.push(key);
                                    } else {
                                        this.dict[key] = this.next;
                                        this.stack.push(key);
                                        value.obj.ref.push(this.next++);
                                    }
                                }
                                value.obj.val.push(this._encodeValue(data[key], frozen));
                            }
                        }
                        // TODO: binary data
                        break;
                    case 'boolean':
                        value.bln = data;
                        break;
                }
            }
            return value;
        };
        
        /** @alias {Encoder} */
        PSON.Encoder = Encoder;
                
        /**
         * Constructs a new PSON Decoder.
         * @param {Array.<string>} values Initial dictionary values
         * @constructor
         */
        var Decoder = function(values) {
        
            /**
             * Dictionary array.
             * @type {Array.<string>}
             */
            this.dict = (values && Array.isArray(values)) ? values : []; 
        };
        
        /**
         * Decodes PSON to JSON.
         * @param {ByteBuffer} buffer PSON
         * @returns {*} JSON
         */
        Decoder.prototype.decode = function(buffer) {
            var msg = PSON.Message.decode(buffer);
            for (var i=0; i<msg.dict.length; i++) {
                this.dict.push(msg.dict[i].str);
            }
            return this._decodeValue(msg.data);
        };
        
        /**
         * Decodes a single PSON value to JSON.
         * @param {PSON.Value} PSON value
         * @returns {*} JSON
         * @private
         */
        Decoder.prototype._decodeValue = function(value) {
            if (value.ref !== null) {
                return this.dict[value.ref]
            } else if (value.udf === true) {
                return undefined;
            } else if (value.obj !== null) {
                var obj = {}, i;
                if (value.obj.ref.length > 0) {
                    for (i=0; i<value.obj.ref.length; i++) {
                        var ref = value.obj.ref[i];
                        var key = this.dict[ref];
                        obj[key] = this._decodeValue(value.obj.val[i]);
                    }
                } else {
                    for (i=0; i<value.obj.key.length; i++) {
                        obj[value.obj.key[i]] = this._decodeValue(value.obj.val[i]);
                    }
                }
                return obj;
            } else if (value.arr !== null) {
                var arr = [];
                for (var j=0; j<value.arr.val.length; j++) {
                    arr.push(this._decodeValue(value.arr.val[j]));
                }
                return arr;
            } else if (value.str !== null) {
                return value.str;
            } else if (value.itg !== null) {
                return value.itg;
            } else if (value.flt !== null) {
                return value.flt;
            } else if (value.dbl !== null) {
                return value.dbl;
            } else if (value.bln !== null) {
                return value.bln;
            } else {
                return null;
            }
        };
        
        /** @alias {Decoder} */
        PSON.Decoder = Decoder;
            
        /**
         * Encodes JSON to PSON using this instance's encoder.
         * @param {*} json JSON
         * @returns {ByteBuffer} PSON
         */
        PSON.prototype.encode = function(json) {
            return this.encoder.encode(json);
        };

        /**
         * Encodes JSON to PSON using this instance's encoder.
         * @param {*} json JSON
         * @returns {Buffer} PSON
         * @throws {Error} If not running on node.js
         */
        PSON.prototype.toBuffer = function(json) {
            return this.encode(json).toBuffer();
        };

        /**
         * Encodes JSON to PSON using this instance's encoder.
         * @param {*} json JSON
         * @returns {ArrayBuffer} PSON
         */
        PSON.prototype.toArrayBuffer = function(json) {
            return this.encode(json).toArraybuffer();
        };
    
        /**
         * Decodes PSON to JSON using this instance's decoder.
         * @param {ByteBuffer|Buffer|ArrayBuffer} pson PSON
         * @returns {*} JSON
         */
        PSON.prototype.decode = function(pson) {
            return this.decoder.decode(pson);
        };
        
        return PSON;
    }

    // Enable module loading if available
    if (typeof module != 'undefined' && module["exports"]) { // CommonJS
        module["exports"] = loadPSON(require("protobufjs"));
    } else if (typeof define != 'undefined' && define["amd"]) { // AMD
        define("PSON", ["ProtoBuf"], loadPSON);
    } else {
        if (!global["dcodeIO"]) {
            global["dcodeIO"] = {};
        }
        global["dcodeIO"]["PSON"] = loadPSON(global["dcodeIO"]["ProtoBuf"]);
    }

})(this);

