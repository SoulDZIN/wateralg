var SortedDictionary = require('../src/util/sorteddictionary.js');

// we're going to verify that the SortedDictionary works as expected.
// we will be making a histogram of the input, the final result should be an ordered list of key / values where the values are the total counts of the keys found in 'inputs'
var input = [1,4,6,1,1,2,3,0,1,4,5,0,5,2,3,5,1,8,4,3];
var expectedOutput = [
    { key: 0, value: 2 },
    { key: 1, value: 5 },
    { key: 2, value: 2 },
    { key: 3, value: 3 },
    { key: 4, value: 3 },
    { key: 5, value: 3 },
    { key: 6, value: 1 },
    { key: 8, value: 1 }
];

var dict = new SortedDictionary();

console.log('checking input:');

seed(dict, input);
check(dict, expectedOutput);

console.log('checking clear:');

dict.removeAll();
check(dict, []);

console.log('checking reverse input:');

seed(dict, input.reverse());
check(dict, expectedOutput);

// --- output result

function seed(dict, input) {
    for(var i = 0; i < input.length; i++) {
        var key = input[i];

        var result = dict.find(key);
        var item = result.item;

        if(!item) {
            dict.set(key, 1);
        } else {
            item.setValue(item.value() + 1);
        }
    }
}

function check(dict, values) {
    if(values.length != dict.count()) {
        throw new Error("Expected count of " + values.length + ". found: " + dict.count());
    }

    for(var i = 0; i < values.length; i++) {
        var testItem = values[i];
        var item = dict.getAt(i);

        if(!item) {
            throw new Error("Expected item at " + i + ". found: " + item);
        }

        var obj = { key: item.key(), value: item.value() };

        console.log(JSON.stringify(obj));

        if(obj.key !== testItem.key || obj.value !== testItem.value) {
            throw new Error("Expected item to be: " + JSON.stringify(testItem) + ". found: " + JSON.stringify(obj));
        }
    }

    console.log("Pass!");
}

