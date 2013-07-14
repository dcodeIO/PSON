// #ifdef UNDEFINED
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
// #endif
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
     * Long.js.
     * @type {?Long}
     */
    var Long = ByteBuffer.Long;

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
                    } else if (Long && val instanceof Long) {
                        buf.writeUint8(T.LONG);
                        buf.writeZigZagVarint64(val);
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
