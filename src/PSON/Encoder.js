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
