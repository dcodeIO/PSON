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
        var ByteBuffer = ProtoBuf.ByteBuffer;
        var Long = ProtoBuf.Long;

        /**
         * Constructs a new combined PSON encoder and decoder.
         * @param {Array.<string>=} values Initial dictionary values
         * @param {boolean=} freezeEncoder Whether to freeze the encoder's dictionary, defaults to `false`
         * @constructor
         */
        var PSON = function(values, freezeEncoder) {
    
            /**
             * PSON encoder.
             * @type {PSON.Encoder}
             */
            this.encoder = new PSON.Encoder(values);
            if (!!freezeEncoder) this.encoder.freeze();
    
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
                                "type": "string",
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
                                "type": "Special",
                                "name": "spc",
                                "id": 1,
                                "options": {}
                            },
                            {
                                "rule": "optional",
                                "type": "uint32",
                                "name": "dic",
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
                                "rule": "repeated",
                                "type": "Value",
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
                                "type": "bytes",
                                "name": "bin",
                                "id": 9,
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
                                "name": "dic",
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
                    }
                ],
                "enums": [
                    {
                        "name": "Special",
                        "values": [
                            {
                                "name": "TRUE",
                                "id": 1
                            },
                            {
                                "name": "FALSE",
                                "id": 2
                            },
                            {
                                "name": "EOBJ",
                                "id": 3
                            },
                            {
                                "name": "EARR",
                                "id": 4
                            },
                            {
                                "name": "ESTR",
                                "id": 5
                            },
                            {
                                "name": "EBIN",
                                "id": 9
                            },
                            {
                                "name": "UDEF",
                                "id": 10
                            }
                        ],
                        "options": {}
                    }
                ],
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
         * PSON special types.
         * @type {Object.<string,number>}
         */
        PSON.Special = proto.Special;
        
        /**
         * PSON value class.
         * @type {Function}
         */
        PSON.Value = proto.Value;
    
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
            msg.dict = this.stack; this.stack = [];
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
                    case 'function':
                        data = data.toString();
                    case 'string':
                        if (data === "") {
                            value.spc = PSON.Special.ESTR;
                        } else if (this.dict.hasOwnProperty(data)) {
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
                            // TODO: float if possible without precision loss
                            value.dbl = data;
                        }
                        break;
                    case 'object':
                        frozen = frozen || !!data["_PSON_FROZEN_"];
                        if (Array.isArray(data)) {
                            if (data.length == 0) {
                                value.spc = PSON.Special.EARR;
                            } else {
                                value.arr = [];
                                for (i=0; i<data.length; i++) {
                                    value.arr.push(this._encodeValue(data[i], frozen));
                                }
                            }
                        } else {
                            try {
                                var bin = ByteBuffer.wrap(data);
                                if (bin.length == 0) {
                                    value.spc = PSON.Special.EBIN;
                                } else {
                                    value.bin = bin;
                                }                        
                            } catch (notBin) {
                                var keys = Object.keys(data), key;
                                if (keys.length == 0) {
                                    value.spc = PSON.Special.EOBJ;
                                } else {
                                    value.obj = new PSON.Object();
                                    for (i=0; i<keys.length; i++) {
                                        key = keys[i];
                                        if (typeof data[key] !== 'undefined') { // Undefined is skipped
                                            if (frozen) { // Skip dictionary if frozen
                                                value.obj.key.push(key);
                                            } else {
                                                if (!this.dict.hasOwnProperty(key)) {
                                                    this.dict[key] = this.next;
                                                    this.stack.push(key);
                                                    value.obj.dic.push(this.next++);
                                                } else {
                                                    value.obj.dic.push(this.dict[key]);
                                                }
                                            }
                                            value.obj.val.push(this._encodeValue(data[key], frozen));
                                        }
                                    }
                                }
                            }
                        }
                        break;
                    case 'boolean':
                        value.spc = data ? PSON.Special.TRUE : PSON.Special.FALSE;
                        break;
                    case 'undefined':
                        value.spc = PSON.Special.UDEF;
                        break;
                }
            } // else null
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
                this.dict.push(msg.dict[i]);
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
            if (value.spc) {
                switch (value.spc) {
                    case PSON.Special.TRUE:
                        return true;
                    case PSON.Special.FALSE:
                        return false;
                    case PSON.Special.EOBJ:
                        return {};
                    case PSON.Special.EARR:
                        return [];
                    case PSON.Special.ESTR:
                        return "";
                    case PSON.Special.EBIN:
                        return new ByteBuffer(0);
                    case PSON.Special.UDEF:
                        return undefined;
                }
            } else if (value.dic !== null) {
                return this.dict[value.dic]
            } else if (value.obj !== null) {
                var obj = {}, i;
                if (value.obj.dic.length > 0) {
                    for (i=0; i<value.obj.dic.length; i++) {
                        var dic = value.obj.dic[i];
                        var key = this.dict[dic];
                        obj[key] = this._decodeValue(value.obj.val[i]);
                    }
                } else {
                    for (i=0; i<value.obj.key.length; i++) {
                        obj[value.obj.key[i]] = this._decodeValue(value.obj.val[i]);
                    }
                }
                return obj;
            } else if (value.arr.length > 0) {
                var arr = [];
                for (var j=0; j<value.arr.length; j++) {
                    arr.push(this._decodeValue(value.arr[j]));
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
            } else if (value.bin !== null) {
                return value.bin; // ByteBuffer
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

