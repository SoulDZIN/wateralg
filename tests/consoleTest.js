// --- requires
var Rx = require('rx');
var WaterStore = require('../src/waterstore.js');

// --- test

var source = [
    4,
    2,
    2,
    6,
    2,
    0,
    3,
    4,
    1,
    0
];

source = source.map(function(x, i) {
    return { height: x, target: "Column " + (i + 1) };
});

console.log("input: ");
console.log(JSON.stringify(source, null, 4));

var obv = Rx.Observable.from(source);
var ws = new WaterStore();

ws.elevateObservable().subscribe(function(x){
    console.log("elevate.next: " + JSON.stringify(x) + " (current result: " + ws.result() + ")");
});

ws.completeObservable().subscribe(function(x){
    console.log("complete.next: " + JSON.stringify(x));
});

obv.subscribe(ws.asObserver());

console.log("result: " + ws.result());
