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
