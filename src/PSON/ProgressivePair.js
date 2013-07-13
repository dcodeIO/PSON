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
    
    return ProgressivePair;
    
})(PSON.Pair, PSON.Encoder, PSON.Decoder);
