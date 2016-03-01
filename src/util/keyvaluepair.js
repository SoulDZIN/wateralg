function KeyValuePair(key, value){
    this._key = key;
    this._value = value;
}

(function(p){

    p.key = function() {
        return this._key;
    };

    p.value = function() {
        return this._value;        
    };

    p.setValue = function(v) {
        this._value = v;
    };

}(KeyValuePair.prototype));

module.exports = KeyValuePair;
