/**
 * @alias PSON.StaticPair
 */
PSON.StaticPair = (function(Pair, Encoder, Decoder) {

    /**
     * Constructs a new static PSON encoder and decoder pair.
     * @exports PSON.StaticPair
     * @class A static PSON encoder and decoder pair.
     * @param {Array.<string>=} dict Static dictionary
     * @param {Object.<string,*>=} options Options
     * @constructor
     * @extends PSON.Pair
     */
    var StaticPair = function(dict, options) {
        Pair.call(this);
        
        this.encoder = new Encoder(dict, false, options);
        this.decoder = new Decoder(dict, false, options);
    };
    
    // Extends PSON.Pair
    StaticPair.prototype = Object.create(Pair.prototype);
    
    return StaticPair;

})(PSON.Pair, PSON.Encoder, PSON.Decoder);
