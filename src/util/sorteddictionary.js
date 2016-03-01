var KeyValuePair = require('./keyvaluepair.js'); // SortedDictionary // ----------------
// This collections stores key value pairs into an array, and maintains that keys are unique and sorted.

function SortedDictionary() {
    this._items = [];
}

(function SortedDictionaryDefine(p){


    p.set = function(key, value) {
        var findResult = this._find(key);
        var item = findResult.item;

        if(item) {
            item.setValue(value);
            return;
        } 

        this._insert(findResult.index, key, value);
    };

    p.find = function (key) {
        return this._find(key);
    };

    p.removeAll = function() {
        this.remove(0, this.count());
    };

    p.remove = function(idx, count) {
        this._remove(idx, count);
    };
    
    p.get = function (key) {
        var result = this.find(key);

        return result.item;
    };

    p.getAt = function(index) {
        return this._items[index];
    };

    p.count = function () {
        return this._items.length;
    };

    // ### internal methods ###
    // =========================

    p._insert = function(index, key, value) {
        var kvp = new KeyValuePair(key, value);

        this._items.splice(index, 0, kvp);
    };
    
    // _find(key)
    // ----------
    // Uses binarySearch() to find the item based on the given key
    //
    // returns: { index: <number>, item: <KeyValuePair> }
    p._find = function(key) {
        var count = this.count();
        
        var compareFn = function compareFn(item) {
            var testKey = item.key();
            return testKey === key 
                ? 0
                : testKey > key 
                ? 1
                : -1;
        };

        var resultFn = function resultFn(idx, isFound, item) {
            return { index: idx, item: item };
        };

        return binarySearch(this._items, compareFn, resultFn, 0, count - 1);
    };

    p._remove = function(idx, count) {
        if(idx < 0 || idx >= this._items.length) {
            throw new Error('Index out of range [' + idx + ']');
        }
        if(count < 0 || idx + count > this._items.length) {
            throw new Error('Count is out of range (' + count + ')');
        }

        this._items.splice(idx, count);
    };


}(SortedDictionary.prototype));

// binarySearch()
// --------------
// Flexible implentation of binary search  (https://en.wikipedia.org/wiki/Binary_search_algorithm)
function binarySearch(items, compareFn, resultFn, a, b) {
    if(a > b) {
        return resultFn(a, false, null);
    }

    var mid = a + Math.floor((b - a) / 2);
    var item = items[mid];
    var compare = compareFn(item);
    
    // compare === 0 - equals
    // compare < 0 - the item is too small
    // comopare > 0 - the item is too big
    if(compare === 0) {
        return resultFn(a, true, item);
    } 

    return compare < 0 
        // the item is too small, look at the larger items
        ? binarySearch(items, compareFn, resultFn, mid + 1, b)
        // the item is too big, look at the smaller items
        : binarySearch(items, compareFn, resultFn, a, mid - 1);
}

module.exports = SortedDictionary;
