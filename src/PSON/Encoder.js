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
     * @param {Object.<string,*>=} options Options
     * @constructor
     */
    var Encoder = function(dict, progressive, options) {

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

        /**
         * Options.
         * @type {Object.<string,*>}
         */
        this.options = options || {};
    };

    /**
     * Encodes JSON to PSON.
     * @param {*} json JSON
     * @param {(!ByteBuffer)=} buf Buffer to encode to. When omitted, the resulting ByteBuffer will be flipped. When
     *  specified, it will not be flipped.
     * @returns {!ByteBuffer} PSON
     */
    Encoder.prototype.encode = function(json, buf) {
        var doFlip = false;
        if (!buf) {
            buf = new ByteBuffer();
            doFlip = true;
        }
        var le = buf.littleEndian;
        try {
            this._encodeValue(json, buf.LE());
            buf.littleEndian = le;
            return doFlip ? buf.flip() : buf;
        } catch (e) {
            buf.littleEndian = le;
            throw(e);
        }
    };

    /**
     * Encodes a single JSON value to PSON.
     * @param {*} val JSON value
     * @param {!ByteBuffer} buf Target buffer
     * @param {boolean=} excluded Whether keywords are to be excluded or not
     * @private
     */
    Encoder.prototype._encodeValue = function(val, buf, excluded) {
        if (val === null) {
            buf.writeUint8(T.NULL);
        } else {
            switch (typeof val) {
                case 'function':
                    val = val.toString();
                    // fall through
                case 'string':
                    if (val.length === 0) {
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
                            buf.writeVarint32ZigZag(val);
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
                    var i;
                    if (Array.isArray(val)) {
                        if (val.length === 0) {
                            buf.writeUint8(T.EARRAY);
                        } else {
                            buf.writeUint8(T.ARRAY);
                            buf.writeVarint32(val.length);
                            for (i=0; i<val.length; i++) {
                                this._encodeValue(val[i], buf);
                            }
                        }
                    } else if (Long && val instanceof Long) {
                        buf.writeUint8(T.LONG);
                        buf.writeVarint64ZigZag(val);
                    } else {
                        try {
                            val = ByteBuffer.wrap(val);
                            buf.writeUint8(T.BINARY);
                            buf.writeVarint32(val.remaining());
                            buf.append(val);
                        } catch (e) {
                            var keys = Object.keys(val);
                            var n = 0;
                            for (i=0; i<keys.length; i++) {
                                if (typeof val[keys[i]] !== 'undefined') n++;
                            }
                            if (n === 0) {
                                buf.writeUint8(T.EOBJECT);
                            } else {
                                buf.writeUint8(T.OBJECT);
                                buf.writeVarint32(n);
                                if (!excluded) excluded = !!val._PSON_EXCL_;
                                for (i=0; i<keys.length; i++) {
                                    var key = keys[i];
                                    if (typeof val[key] === 'undefined') continue;
                                    if (this.dict.hasOwnProperty(key)) {
                                        buf.writeUint8(T.STRING_GET);
                                        buf.writeVarint32(this.dict[key]);
                                    } else {
                                        if (this.progressive && !excluded) {
                                            // Add to dictionary
                                            this.dict[key] = this.next++;
                                            buf.writeUint8(T.STRING_ADD);
                                        } else {
                                            // Plain string
                                            buf.writeUint8(T.STRING);
                                        }
                                        buf.writeVString(key);
                                    }
                                    this._encodeValue(val[key], buf);
                                }
                            }
                        }
                    }
                    break;
                case 'undefined':
                    buf.writeUint8(T.NULL);
                    break;
            }
        }
    };
    
    return Encoder;
    
})(ByteBuffer, PSON.T);
