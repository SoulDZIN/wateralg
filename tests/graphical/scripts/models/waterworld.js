var WaterStore = require('src/waterstore.js');
var Rx = require('rx');
var Pillar = require('./pillar');
var util = require('util');

function WaterWorld() {
    this._store = new WaterStore();
    this._pillars = [];

    this._createSubject = new Rx.Subject();
    this._elevateObservable = this._buildElevateObservable();
    this._changeObservable = this._buildChangeObservable();
}

util.extend(WaterWorld.prototype, {
    insertPillar: function(height) {
        var pillar = new Pi

        this._pillars.push(pillar);
        this._triggerCreate(pillar);
        this._store.read({
            height: height,
            target: pillar
        });
    },
    getChangeObservable: function () {
        return this._changeObservable;
    },
    _createPillar: function(height) {
        validateInteger("'height' must be an integer.", height);
        
        return new Pillar
    },
    _triggerCreate: function(pillar) {
        this._createSubject.onNext(pillar);
    },
    _buildChangeObservable: function () {
        return Rx.Observable.merge(
            this._createSubject.select(function (x) {
                return { action: 'create', target: x };
            }),
            this._elevateObservable.select(function (x) {
                x['action'] = 'update';
                return x;
            }));
    },
    _buildElevateObservable: function () {
        return this._store
            .elevateObservable()
            .select(function (obj){
                var pillar = obj.target;
                pillar.addWater(obj.height);
                return obj;
            });
    },
});

function validateInteger(message, val, opt) {
    opt = opt || { min: false };

    if(typeof(val) !== 'number' 
        || (opt.min !== false && val < opt.min) 
        || val % 1 !== 0) {
        throw new Error('Unexpected value (' + val + '). ' + message);
    } 
}

module.exports = WaterWorld;
