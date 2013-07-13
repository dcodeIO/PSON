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
