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
            // #include "PSON.json"
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
    
        // #include "PSON/Encoder.js"
        
        // #include "PSON/Decoder.js"
    
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
