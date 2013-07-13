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
 * @alias PSON.StaticPair
 */
PSON.StaticPair = (function(Pair, Encoder, Decoder) {

    /**
     * Constructs a new static PSON encoder and decoder pair.
     * @exports PSON.StaticPair
     * @class A static PSON encoder and decoder pair.
     * @param {Array.<string>=} dict Static dictionary
     * @constructor
     * @extends PSON.Pair
     */
    var StaticPair = function(dict) {
        Pair.call(this);
        
        // Static encoder
        this.encoder = new Encoder(dict, false);
        
        // Static decoder
        this.decoder = new Decoder(dict, false);
    };
    
    // Extends PSON.Pair
    StaticPair.prototype = Object.create(Pair.prototype);
    
    return StaticPair;

})(PSON.Pair, PSON.Encoder, PSON.Decoder);
