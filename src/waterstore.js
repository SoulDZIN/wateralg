var SortedDictionary = require('./util/sorteddictionary.js');
var Rx = require('rx');
var util = require('util');
var extend = util._extend;

function WaterStore(opt) {
    this._isComplete = false;    
    this._options = this._initOptions(opt);
    this._heightTable = new SortedDictionary();
    this._result = 0;
    this._subjectElevate = new Rx.Subject();
    this._subjectComplete = new Rx.Subject();
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
    read: function(column) {
        column = this._validate(column);

        this._read(column);
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

        this._clearTable();
        this._subjectElevate.onCompleted();
        this._subjectComplete.onCompleted();
    },

    elevateObservable: function() {
        return this._subjectElevate.asObservable();
    },

    completeObservable: function() {
        return this._subjectComplete.asObservable();
    },

    asObserver: function() {
        var self = this;
        return Rx.Observer.create(
            function(x) {
                self.read(x);                
            },
            function(err) {
                console.log("An error occurred in the WaterStoreObserver! Details: " + err);
            },
            function() {
                self.complete();
            });

    },

    // ------------------------
    // ### internal methods ###
    // ------------------------

    _read: function(column) {
        var count = this._heightTable.count();

        var index = this._insert(column);

        var isLargest = index === count;

        // if we just inserted the largest, then use the next heighest height
        if(isLargest) {
            index -= 1;
        }

        this._elevateToIndex(index);

        // get new count, and clean up if necessary
        count = this._heightTable.count();

        if(count === 1 || isLargest) {
            this._clearTable();
            this._insert(column);
        }
    },

    _elevateToIndex: function(index) {
        if(index <= 0) {
            return; // nothing to elevate
        }

        var kvp = this._heightTable.getAt(index);
        var height = kvp.key();
        var record = kvp.value();

        for(var i = 0; i < index; i++) {
            // --- get closingItem and calculate total amount that will be elevated
            var closingKVP = this._heightTable.getAt(i);            
            var closingHeight = closingKVP.key();
            var closingRecord = closingKVP.value();
            var elevateHeight = height - closingHeight;
            var total = elevateHeight * closingRecord.width;

            // --- add to result
            this._addToResult(total);

            this._elevateRecord(closingRecord, elevateHeight, record);
        }

        // --- clear everything up to the elevated height
        this._heightTable.remove(0, index);
    },

    _insert: function(column) {
        var height = column.height;
        var searchResult = this._heightTable.find(height);
        var index = searchResult.index;
        var record = searchResult.item ? searchResult.item.value() : null;

        if(!record) {
            record = this._createRecord();
            this._heightTable.set(height, record);
        }
        
        this._addToRecord(record, column);

        return index;
    },

    _addToResult: function(add) {
        this._result += add;
    },

    _validate: function(column) {
        if(this._isComplete) {
            throw new Error("WaterStore is complete and cannot read any more input");
        } 

        var height = column;
        var target = null;

        if(typeof(column) === 'object') {
            if(column === null) {
                throw new Error("Invalid input: null");
            } else {
                height = column.height;
                target = column.target;
            }
        }

        height = Number(height);
        
        if(isNaN(height)) {
            throw new Error("Invalid input: NaN");
        }

        return this._createColumn(height, target);
    }, 

    _initOptions: function(opt) {
        var options = extend({}, WaterStore.DEFAULT);

        if(opt) {
            options = extend(options, opt);
        }

        return options;
    },

    // _createColumn
    // -------------
    // this creates a column object which is used in the _read method. The "obj" is passed onto the Elevate and Complete observable.
    // -------------

    _createColumn: function(height, obj) {
        return { height: height, target: obj };
    },

    // _createRecord()
    // ---------------
    // this creates an initial record to save in the heightTablee
    // ---------------
    _createRecord: function() {
        return { width: 0, columns: [] }; 
    },

    _clearTable: function() {
        var count = this._heightTable.count();

        for(var i = 0; i < count; i++) {
            var item = this._heightTable.getAt(i);
            var record = item.value();
            this._triggerComplete(record);
        }

        this._heightTable.removeAll();
    },

    _elevateRecord: function(source, elevateHeight, dest) {
        // --- callbacks
        this._triggerElevate(source, elevateHeight);

        // --- add to dest

        dest.width += source.width;
        dest.columns = dest.columns.concat(source.columns);
    },

    _addToRecord: function(record, column) {
        record.width++;
        if(column.target) {
            record.columns.push(column.target);
        }
    },

    _triggerComplete: function(record) {
        var args = record.columns.map(function(x) {
            return {
                target: x
            };
        });

        this._trigger(this._subjectComplete, args);
    },

    _triggerElevate: function(record, elevateHeight) {
        var args = record.columns.map(function(x) {
            return {
                target: x,
                height: elevateHeight
            };
        });

        this._trigger(this._subjectElevate, args);
    },

    _trigger: function(subject, args) {
        Rx.Observable.from(args).subscribe(function(x){
            subject.onNext(x);
        });
    }
});

module.exports = WaterStore;
