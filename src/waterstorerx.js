var Rx = require('rx');
var WaterStore = require('./waterstore.js');

function createObserver(waterStore) {
    return Rx.Observer.create(
        function(x) {
            waterStore.read(x);
        },
        function(err) {
            console.log("An error occurred in the WaterStoreObserver! Details: " + err);
        },
        function() {
            waterStore.complete();
        });
}

module.exports = {
    createObserver: createObserver
};
