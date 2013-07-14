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
    
    function loadPSON(ByteBuffer) {
        if (!ByteBuffer) {
            throw(new Error("PSON requires ByteBuffer.js: Get it at https://github.com/dcodeIO/ByteBuffer.js"));
        }

        /**
         * PSON namespace.
         * @exports PSON
         * @namespace
         */
        var PSON = {};

        /**
         * @alias PSON.T
         */
        PSON.T = (function() {
        
            /**
             * PSON byte types.
             * @exports PSON.T
             * @namespace
             */
            var T = {};
            
            T.ZERO       = 0x00; // 0
            //             0x01; // -1
            //             0x02; // 1
            //             ...   // zig-zag encoded varints
            T.MAX        = 0xEF; // -120, max. zig-tag encoded varint
            
            T.NULL       = 0xF0; // null
            T.TRUE       = 0xF1; // true
            T.FALSE      = 0xF2; // false
            T.EOBJECT    = 0xF3; // {}
            T.EARRAY     = 0xF4; // []
            T.ESTRING    = 0xF5; // ""
            T.OBJECT     = 0xF6; // {...}
            T.ARRAY      = 0xF7; // [...]
            T.INTEGER    = 0xF8; // number (zig-zag encoded varint32)
            T.LONG       = 0xF9; // Long   (zig-zag encoded varint64)
            T.FLOAT      = 0xFA; // number (float32)
            T.DOUBLE     = 0xFB; // number (float64)
            T.STRING     = 0xFC; // string (varint length + data)
            T.STRING_ADD = 0xFD; // string (varint length + data + add to dictionary)
            T.STRING_GET = 0xFE; // string (varint index to get from dictionary)
            T.BINARY     = 0xFF; // ArrayBuffer (varint length + bytes)
            
            return T;
            
        })();
                
        /**
         * @alias PSON.Encoder
         */
        PSON.Encoder = (function(ByteBuffer, T) {
        
            /**
             * Float conversion test buffer.
             * @type {!ByteBuffer}
             */
            var fbuf = new ByteBuffer(4);
            fbuf.length = 4;
        
            /**
             * Constructs a new PSON Encoder.
             * @exports PSON.Encoder
             * @class A PSON Encoder.
             * @param {Array.<string>=} dict Initial dictionary
             * @param {boolean} progressive Whether this is a progressive or a static encoder
             * @constructor
             */
            var Encoder = function(dict, progressive) {
        
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
                if (dict && Array.isArray(dict)) {
                    while (this.next < dict.length) {
                        this.dict[dict[this.next]] = this.next++;
                    }
                }
        
                /**
                 * Whether the encoder is progressive or static.
                 * @type {boolean}
                 */
                this.progressive = !!progressive;
            };
        
            /**
             * Encodes JSON to PSON.
             * @param {*} json JSON
             * @param {(!ByteBuffer)=} buf Buffer to encode to
             * @returns {!ByteBuffer} PSON
             */
            Encoder.prototype.encode = function(json, buf) {
                if (!buf) {
                    buf = new ByteBuffer();
                }
                var le = buf.littleEndian;
                try {
                    this._encodeValue(json, buf.LE());
                    buf.littleEndian = le;
                    return buf;
                } catch (e) {
                    buf.littleEndian = le;
                    throw(e);
                }
            };
        
            /**
             * Encodes a single JSON value to PSON.
             * @param {*} val JSON value
             * @param {!ByteBuffer} buf Target buffer
             * @private
             */
            Encoder.prototype._encodeValue = function(val, buf) {
                if (val === null) {
                    buf.writeUint8(T.NULL);
                } else {
                    switch (typeof val) {
                        case 'function':
                            val = val.toString();
                            // fall through
                        case 'string':
                            if (val.length == 0) {
                                buf.writeUint8(T.ESTRING);
                            } else {
                                if (this.dict.hasOwnProperty(val)) {
                                    buf.writeUint8(T.STRING_GET);
                                    buf.writeVarint32(this.dict[val]);
                                } else {
                                    buf.writeUint8(T.STRING);
                                    buf.writeVString(val);
                                }
                            }
                            break;
                        case 'number':
                            var intVal = parseInt(val);
                            if (val === intVal) {
                                var zzval = ByteBuffer.zigZagEncode32(val); // unsigned
                                if (zzval <= T.MAX) {
                                    buf.writeUint8(zzval);
                                } else {
                                    buf.writeUint8(T.INTEGER);
                                    buf.writeZigZagVarint32(val);
                                }
                            } else {
                                fbuf.writeFloat32(val, 0);
                                if (val === fbuf.readFloat32(0)) {
                                    buf.writeUint8(T.FLOAT);
                                    buf.writeFloat32(val);
                                } else {
                                    buf.writeUint8(T.DOUBLE);
                                    buf.writeFloat64(val);
                                }
                            }
                            break;
                        case 'boolean':
                            buf.writeUint8(val ? T.TRUE : T.FALSE);
                            break;
                        case 'object':
                            if (Array.isArray(val)) {
                                if (val.length == 0) {
                                    buf.writeUint8(T.EARRAY);
                                } else {
                                    buf.writeUint8(T.ARRAY);
                                    buf.writeVarint32(val.length);
                                    for (var i=0; i<val.length; i++) {
                                        this._encodeValue(val[i], buf);
                                    }
                                }
                            } else {
                                try {
                                    val = ByteBuffer.wrap(val);
                                    buf.writeUint8(T.BINARY);
                                    buf.writeVarint32(val.length);
                                    buf.append(val);
                                } catch (e) {
                                    var keys = Object.keys(val);
                                    if (keys.length == 0) {
                                        buf.writeUint8(T.EOBJECT);
                                    } else {
                                        buf.writeUint8(T.OBJECT);
                                        buf.writeVarint32(keys.length);
                                        for (var i=0; i<keys.length; i++) {
                                            var key = keys[i];
                                            if (this.dict.hasOwnProperty(key)) {
                                                buf.writeUint8(T.STRING_GET);
                                                buf.writeVarint32(this.dict[key]);
                                            } else {
                                                if (this.progressive) {
                                                    // Add to dictionary
                                                    this.dict[key] = this.next++;
                                                    buf.writeUint8(T.STRING_ADD);
                                                    buf.writeVString(key);
                                                } else {
                                                    // Plain string
                                                    buf.writeUint8(T.STRING);
                                                    buf.writeVString(key);
                                                }
                                            }
                                            this._encodeValue(val[key], buf);
                                        }
                                    }
                                }
                            }
                            break;
                        case 'undefined':
                            buf.writeUint8(T.UNDEFINED);
                            break;
                    }
                }
            };
            
            return Encoder;
            
        })(ByteBuffer, PSON.T);
                
        /**
         * @alias PSON.Decoder
         */
        PSON.Decoder = (function(ByteBuffer, T) {
        
            /**
             * Constructs a new PSON Decoder.
             * @exports PSON.Decoder
             * @class A PSON Decoder.
             * @param {Array.<string>} dict Initial dictionary values
             * @constructor
             */
            var Decoder = function(dict, progressive) {
        
                /**
                 * Dictionary array.
                 * @type {Array.<string>}
                 */
                this.dict = (dict && Array.isArray(dict)) ? dict : [];
        
                /**
                 * Whether this is a progressive or a static decoder.
                 * @type {boolean}
                 */
                this.progressive = !!progressive;
            };
        
            /**
             * Decodes PSON to JSON.
             * @param {!(ByteBuffer|ArrayBuffer|Buffer)} buf PSON
             * @returns {?} JSON
             */
            Decoder.prototype.decode = function(buf) {
                if (!(buf instanceof ByteBuffer)) {
                    buf = ByteBuffer.wrap(buf);
                }
                var le = buf.littleEndian;
                try {
                    var val = this._decodeValue(buf.LE());
                    buf.littleEndian = le;
                    return val;
                } catch (e) {
                    buf.littleEndian = le;
                    throw(e);
                }
            };
        
            /**
             * Decodes a single PSON value to JSON.
             * @param {!ByteBuffer} buf Buffer to decode from
             * @returns {?} JSON
             * @private
             */
            Decoder.prototype._decodeValue = function(buf) {
                var t = buf.readUint8();
                if (t <= T.MAX) {
                    return ByteBuffer.zigZagDecode32(t);
                } else {
                    switch (t) {
                        case T.NULL: return null;
                        case T.TRUE: return true;
                        case T.FALSE: return false;
                        case T.EOBJECT: return {};
                        case T.EARRAY: return [];
                        case T.ESTRING: return "";
                        case T.OBJECT:
                            t = buf.readVarint32(); // #keys
                            var obj = {};
                            while (--t>=0) {
                                obj[this._decodeValue(buf)] = this._decodeValue(buf);
                            }
                            return obj;
                        case T.ARRAY:
                            t = buf.readVarint32(); // #items
                            var arr = [];
                            while (--t>=0) {
                                arr.push(this._decodeValue(buf));
                            }
                            return arr;
                        case T.INTEGER: return buf.readZigZagVarint32();
                        case T.LONG: return buf.readZigZagVarint64();
                        case T.FLOAT: return buf.readFloat32();
                        case T.DOUBLE: return buf.readFloat64();
                        case T.STRING: return buf.readVString();
                        case T.STRING_ADD:
                            var str = buf.readVString();
                            this.dict.push(str);
                            return str;
                        case T.STRING_GET:
                            return this.dict[buf.readVarint32()];
                        case T.BINARY:
                            t = buf.readVarint32();
                            return buf.slice(buf.offset, buf.offset+t);
                        default:
                            throw(new Error("Illegal type at "+buf.offset+": "+t));
                    }
                }
            };
            
            return Decoder;
            
        })(ByteBuffer, PSON.T);
                
        /**
         * @alias PSON.Pair
         */
        PSON.Pair = (function() {
        
            /**
             * Constructs a new abstract PSON encoder and decoder pair.
             * @exports PSON.Pair
             * @class An abstract PSON encoder and decoder pair.
             * @constructor
             * @abstract
             */
            var Pair = function() {
        
                /**
                 * PSON Encoder.
                 * @type {!PSON.Encoder}
                 * @expose
                 */
                this.encoder;
        
                /**
                 * PSON Decoder.
                 * @type {!PSON.Decoder}
                 * @expose
                 */
                this.decoder;
            };
        
            /**
             * Encodes JSON to PSON.
             * @param {*} json JSON
             * @returns {!ByteBuffer} PSON
             * @expose
             */
            Pair.prototype.encode = function(json) {
                return this.encoder.encode(json);
            };
        
            /**
             * Encodes JSON straight to an ArrayBuffer of PSON.
             * @param {*} json JSON
             * @returns {!ArrayBuffer} PSON as ArrayBuffer
             * @expose
             */
            Pair.prototype.toArrayBuffer = function(json) {
                return this.encoder.encode(json).toArrayBuffer();
            };
        
            /**
             * Encodes JSON straight to a node Buffer of PSON.
             * @param {*} json JSON
             * @returns {!Buffer} PSON as node Buffer
             * @expose
             */
            Pair.prototype.toBuffer = function(json) {
                return this.encoder.encode(json).toBuffer();
            };
        
            /**
             * Decodes PSON to JSON.
             * @param {ByteBuffer|ArrayBuffer|Buffer} pson PSON
             * @returns {*} JSON
             * @expose
             */
            Pair.prototype.decode = function(pson) {
                return this.decoder.decode(pson);
            };
        
            return Pair;
        })();
                
        /**
         * @alias PSON.StaticPair
         */
        PSON.StaticPair = (function(Pair, Encoder, Decoder) {
        
            /**
             * Constructs a new static PSON encoder and decoder pair.
             * @exports PSON.StaticPair
             * @class A static PSON encoder and decoder pair.
             * @param {Array.<string>=} dict Static dictionary
             * @constructor
             * @extends PSON.Pair
             */
            var StaticPair = function(dict) {
                Pair.call(this);
                
                // Static encoder
                this.encoder = new Encoder(dict, false);
                
                // Static decoder
                this.decoder = new Decoder(dict, false);
            };
            
            // Extends PSON.Pair
            StaticPair.prototype = Object.create(Pair.prototype);
            
            return StaticPair;
        
        })(PSON.Pair, PSON.Encoder, PSON.Decoder);
                
        /**
         * @alias PSON.ProgressivePair
         */
        PSON.ProgressivePair = (function(Pair, Encoder, Decoder) {
        
            /**
             * Constructs a new progressive PSON encoder and decoder pair.
             * @exports PSON.ProgressivePair
             * @class A progressive PSON encoder and decoder pair.
             * @param {Array.<string>=} dict Initial dictionary
             * @constructor
             * @extends PSON.Pair
             */
            var ProgressivePair = function(dict) {
                Pair.call(this);
                
                // Progressive encoder
                this.encoder = new Encoder(dict, true);
                
                // Progressive decoder
                this.decoder = new Decoder(dict, true);
            };
            
            // Extends PSON.Pair
            ProgressivePair.prototype = Object.create(Pair.prototype);
        
        
            /**
             * Alias for {@link PSON.exclude}.
             * @param {Object} obj Now excluded object
             */
            ProgressivePair.prototype.exclude = function(obj) {
                PSON.exclude(obj);
            };
        
            /**
             * Alias for {@link PSON.include}.
             * @param {Object} obj New included object
             */
            ProgressivePair.prototype.include = function(obj) {
                PSON.include(obj);
            };
            
            return ProgressivePair;
            
        })(PSON.Pair, PSON.Encoder, PSON.Decoder);
        
        /**
         * Excluces an object's and its children's keys from being added to a progressive dictionary.
         * @param {Object} obj Now excluded object
         */
        PSON.exclude = function(obj) {
            if (typeof obj === 'object') {
                Object.defineProperty(obj, "_PSON_FROZEN_", {
                    value: true,
                    enumerable: false,
                    configurable: true
                });
            }
        };

        /**
         * Undoes exclusion of an object's and its children's keys from being added to a progressive dictionary.
         * @param {Object} obj Now included object
         */
        PSON.include = function(obj) {
            if (typeof obj === 'object') {
                delete obj["_PSON_FROZEN_"];
            }
        };
        
        return PSON;
    }

    // Enable module loading if available
    if (typeof module != 'undefined' && module["exports"]) { // CommonJS
        module["exports"] = loadPSON(require("bytebuffer"));
    } else if (typeof define != 'undefined' && define["amd"]) { // AMD
        define("PSON", ["ByteBuffer"], loadPSON);
    } else {
        if (!global["dcodeIO"]) {
            global["dcodeIO"] = {};
        }
        global["dcodeIO"]["PSON"] = loadPSON(global["dcodeIO"]["ByteBuffer"]);
    }

})(this);

