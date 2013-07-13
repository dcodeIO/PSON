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
