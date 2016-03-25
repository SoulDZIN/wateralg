var WaterStore = require('src/waterstore.js');

function WaterWorld() {
    this._store = new WaterStore();
}

module.exports = WaterWorld;
