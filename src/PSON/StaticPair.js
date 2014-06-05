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
