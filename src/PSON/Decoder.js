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
    if (value.ref !== null) {
        return this.dict[value.ref]
    } else if (value.nil === true) {
        return null;
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
