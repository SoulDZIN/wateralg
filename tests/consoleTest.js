// --- requires
var Rx = require('rx');
var WaterStore = require('../src/waterstore.js');
var WaterStoreRx = require('../src/waterstorerx.js');

// --- test

var obv = Rx.Observable.from([4,2,2,6,2,0,3,4,1,0]);
var ws = new WaterStore();
var wsObserver = WaterStoreRx.createObserver(ws);

obv.subscribe(wsObserver);

console.log("result: " + ws.result());
