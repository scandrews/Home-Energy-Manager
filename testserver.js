
// from https://stackoverflow.com/questions/9422756/search-a-javascript-object-for-a-property-with-a-specific-value

console.log("here in test server")

var testObj = {
    test: 'testValue',
    test1: 'testValue1',
    test2: {
        test2a: 'testValue',
        test2b: 'testValue1'
    }
}

function searchObj (obj, query) {

    for (var key in obj) {
        var value = obj[key];

        if (typeof value === 'object') {
            searchObj(value, query);
        }

        if (value === query) {
            console.log('property=' + key + ' value=' + value);
        }

    }

}

searchObj(testObj, "testValue");

console.log("we're domne");

