var log = require("./log");

// allows chaining (inner function returns itself)
exports.IO = function(fn) {
    return chain(function(args, expect) {
        if (typeof args !== "object") args = [args];

        log.clear();
        try { var result = fn.apply(null, args) }
        catch (e) { log.add(e, "error") }
        if (JSON.stringify(result) == JSON.stringify(expect)) {
            log.post(fn.name + "(" + args + ") === [" + expect + "]");
        } else {
            throw new Error("<<< Test Failed: " + fn.name + "(" + args + "). " +
            "Expected value: " + expect + ", " + 
            "Actual value: " + result + " >>>\n");
        }
    });
}

exports.equal = function(a, b) {
    log.clear();

    if (a != b) {
        throw new Error("<<< Test Failed: " + a + " !== " + b + " >>>\n");
    }
    log.post(".");
    return exports.equal;
}

// for functions that take many arguments and return an array of that same size
// checks that any order of arguments returns the corresponding result
exports.IOPermutable = function(fn) {
    return function(args, expect) {
        var permArgs = permutations(args);
        var permExpect = permutations(expect);
        // checks that any order of arguments creates the same ordered results
        for (var i = 0; i < permArgs.length; i++) {
            exports.IO(fn)(permArgs[i], permExpect[i]);
        }
    }
}

function permutations(arr) {
    var results = [];
    if (arr.length === 1) {
        results.push(arr);
        return results;
    }

    for (var i = 0; i < arr.length; i++) {
        var rest = arr.slice(0);
        var elem = rest.splice(i, 1)[0];
        permutations(rest).map(function (a) {
            a.unshift(elem);
            results.push(a);
        });
    }
    return results;
}