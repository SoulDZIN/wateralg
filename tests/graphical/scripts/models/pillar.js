var util = require('util');

function Pillar(opt) {
    opt = validateInput(opt);

    this._blockHeight = opt.height;
    this._waterHeight = 0;
}

util.extend(Pillar.prototype, {
    blockHeight: function blockHeight() {
        return this._blockHeight;
    },
    waterHeight: function waterHeight() {
        return this._waterHeight;
    },
    addWater: function addWater(val) {
        validateInteger('\'val\' must be a non-negative integer.', val, { min: -1 });
        this._waterHeight += val;
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

function validateInput(opt) {
    if(typeof(opt) !== 'object') {
        opt = { height: opt };
    }

    validateInteger('\'height\' must be a positive integer.', opt.height, { min: 0 });

    return opt;
}

module.exports = Pillar;
