/**
 * @alias PSON.ProgressivePair
 */
PSON.ProgressivePair = (function(Pair, Encoder, Decoder) {

    /**
     * Constructs a new progressive PSON encoder and decoder pair.
     * @exports PSON.ProgressivePair
     * @class A progressive PSON encoder and decoder pair.
     * @param {Array.<string>=} dict Initial dictionary
     * @param {Object.<string,*>=} options Options
     * @constructor
     * @extends PSON.Pair
     */
    var ProgressivePair = function(dict, options) {
        Pair.call(this);

        this.encoder = new Encoder(dict, true, options);
        this.decoder = new Decoder(dict, true, options);
    };
    
    // Extends PSON.Pair
    ProgressivePair.prototype = Object.create(Pair.prototype);

    /**
     * Alias for {@link PSON.exclude}.
     * @param {Object} obj Now excluded object
     */
    ProgressivePair.prototype.exclude = function(obj) {
        PSON.exclude(obj);
    };

    /**
     * Alias for {@link PSON.include}.
     * @param {Object} obj New included object
     */
    ProgressivePair.prototype.include = function(obj) {
        PSON.include(obj);
    };
    
    return ProgressivePair;
    
})(PSON.Pair, PSON.Encoder, PSON.Decoder);
