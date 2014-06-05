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

        //? include("PSON/T.js");
        
        //? include("PSON/Encoder.js");
        
        //? include("PSON/Decoder.js");
        
        //? include("PSON/Pair.js");
        
        //? include("PSON/StaticPair.js");
        
        //? include("PSON/ProgressivePair.js");

        /**
         * Excluces an object's and its children's keys from being added to a progressive dictionary.
         * @param {Object} obj Now excluded object
         */
        PSON.exclude = function(obj) {
            if (typeof obj === 'object') {
                Object.defineProperty(obj, "_PSON_EXCL_", {
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
                delete obj["_PSON_EXCL_"];
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
