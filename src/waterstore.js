var SortedDictionary = require('./util/sorteddictionary.js');
var util = require('util');
var extend = util._extend;

function WaterStore(opt) {
    this._isComplete = false;    
    this._options = this._initOptions(opt);
    this._heightTable = new SortedDictionary();
    this._result = 0;
}

WaterStore.DEFAULT = {
    debug: false
};

extend(WaterStore.prototype, {
    //  -----------------------
    //  ### public methods ###
    //  -----------------------

    // read(height)
    // ------------
    // this method reads the next height and adds the possible amount of water storage to the
    // result
    // ------------
    read: function(height, callbackObj) {
        height = this._validate(height);

        this._read(this._createPillar(height, callbackObj));
    },
    
    // result()
    // --------
    // this method returns the current result, which is the total possible amount of water 
    // storage given the heights
    // ---------
    result: function() {
        return this._result;
    },

    // complete()
    // ----------
    // this method completes the WaterStore, disposing of any cached data, and 
    complete: function() {
        this._isComplete = true;
    },

    // ------------------------
    // ### internal methods ###
    // ------------------------

    _read: function(pillar) {
        var findResult = this._heightTable.find(pillar.height);
        var findIndex = findResult.index;
        var count = this._heightTable.count();

        this._insert(pillar, findResult.item);

        var closeIndex = findIndex;
        var isLargest = closeIndex === count;

        // if we just inserted the largest, then use the next heighest height
        if(isLargest) {
            closeIndex -= 1;
        }

        this._elevateAndAggregate(closeIndex);

        // get new count, and clean up if necessary
        count = this._heightTable.count();

        if(count === 1 || isLargest) {
            this._clearTable();
            this._insert(pillar);
        }
    },

    _elevateAndAggregate: function(index) {
        if(index <= 0) {
            return; // nothing to elevate
        }

        var item = this._heightTable.getAt(index);
        var height = item.key();
        var record = item.value();

        for(var i = 0; i < index; i++) {
            // --- get closingItem and calculate total amount that will be elevated
            var closingItem = this._heightTable.getAt(i);            
            var closingHeight = closingItem.key();
            var closingRecord = closingItem.value();
            var elevateHeight = height - closingHeight;
            var total = elevateHeight * closingRecord.width;

            // --- add to result
            this._addToResult(total);

            this._elevateRecord(closingRecord, elevateHeight, record);
        }

        // --- clear everything up to the elevated height
        this._heightTable.remove(0, index);
    },

    _insert: function(pillar, item) {
        var record = null;
        var height = pillar.height;

        if(item) {
            record = item.value();
        } else {
            record = this._createRecord();
            this._heightTable.set(height, record);
        }

        this._addToRecord(record, pillar);
    },

    _addToResult: function(add) {
        this._result += add;
    },

    _validate: function(height) {
        if(this._isComplete) {
            throw new Error("WaterStore is complete and cannot read any more input");
        } 

        height = Number(height);
        
        if(isNaN(height)) {
            throw new Error("Invalid input: NaN");
        }

        return height;
    }, 

    _initOptions: function(opt) {
        var options = extend({}, WaterStore.DEFAULT);

        if(opt) {
            options = extend(options, opt);
        }

        return options;
    },

    // _createPillar
    // -------------
    // this creates a pillar object which is used in the _read method. Callbacks are used to trigger when elevation happens on this specific pillar.
    // callbackObj is optional, but makes it possible to create a view.
    //
    // callbackObj: { onElevate: <function>, onComplete: <function> }
    // -------------

    _createPillar: function(height, callbackObj) {
        return { height: height, callback: callbackObj };
    },

    // _createRecord()
    // ---------------
    // this creates an initial record to save in the heightTablee
    // ---------------
    _createRecord: function() {
        return { width: 0, callbacks: [] }; 
    },

    _clearTable: function() {
        var count = this._heightTable.count();

        for(var i = 0; i < count; i++) {
            var item = this._heightTable.getAt(i);
            var record = item.value();
            this._callCompleteRecord(record);
        }

        this._heightTable.removeAll();
    },

    _elevateRecord: function(source, elevateHeight, dest) {
        // --- callbacks
        this._callElevateRecord(source, elevateHeight);

        // --- add to dest

        dest.width += source.width;
        dest.callbacks = dest.callbacks.concat(source.callbacks);
    },

    _addToRecord: function(record, pillar) {
        record.width++;
        if(pillar.callback) {
            record.callbacks.push(pillar.callback);
        }
    },

    _callCompleteRecord: function(record) {
        this._callRecord(record, 'onComplete');
    },

    _callElevateRecord: function(record, elevateHeight) {
        this._callRecord(record, 'onElevate', [elevateHeight]);
    },

    _callRecord: function(record, name, args) {
        for(var i = 0; i < record.callbacks.length; i++) {
            var callbackObj = record.callbacks[i];
            var callbackFn = callbackObj[fn];
            if(callbackFn) {
                callbackFn.apply(this, args || []);
            }
        }
    }

});

module.exports = WaterStore;
