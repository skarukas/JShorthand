//include("assert-log.js");

function ___(val) {
    if (!(val instanceof Object)) {
        throw new TypeError("Immutable types cannot be wrapped.");
    } else if (val.$isWrapper) {
        return val;
    } else if (val instanceof Function) {
        return chain(val);
    } else {
        return wrap(val);
    }
}

function wrapPrimitive(val) {
    var type = typeof val;
    type = type[0].toUpperCase().concat(type.substring(1));
    var evalString = "new " + type + "(" + evalHandleString(val) + ")";
    log.post(evalString);
    return eval(evalString);
}

function evalHandleString(str) {
    if (typeof str === "string") return "\"" + str + "\"";
    else return str;
}

function getAllProperties(obj) {
    if (Object.getPrototypeOf(obj) == null) return [];
    return Object.getOwnPropertyNames(obj).concat(getAllProperties(Object.getPrototypeOf(obj)));
}

// NEEDS WORK/TESTING!!
// allows a function with no return value to be called repeatedly by returning itself
function chain(fn) {
    var inner = function() {
        inner.$currValue = fn.apply(null, arguments);
        return inner;
    }
    return inner;
}

/* function Wrapper(obj) {

    this.$inner = obj;
    this.$currValue = obj;

    this.toString = function() {
        return wrapper.$currValue;
    }
    this.valueOf = function() {
        return wrapper.$currValue;
    }

    var fields = logAllProperties(obj);
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        if (obj[field] instanceof Function) {
            addWrappedMethod(field);
        } else if (obj.hasOwnProperty(field)) {
            addWrappedProperty(field);
        }
    }

    function addWrappedMethod(name) {
        this[name] = function() {
            this.$currValue = obj[name].apply(obj, arguments);
            this.$currMethod = name;
            return this;
        }
    }

    function addWrappedProperty(name) {
        if (this[name] == null) {
            Object.defineProperty(this, name, {
                get: function() { return obj[name] },
                set: function(val) { obj[name] = val }
            });
        }
    }

    return function() {
        this[this.$currMethod].apply(this, arguments);
    }
}

function wrap(obj) {
    return new Wrapper(obj);
}
 */

function name() {
    wrapper.$currValue = wrapper.$inner[name].apply(wrapper.$inner, arguments);
    if (typeof wrapPrimitive(wrapper.$currValue) == typeof wrapper.$inner) { 
        wrapper.$currMethod = name;
    } else {
        wrapper.$currMethod = "$chainTypeError";
    }
    wrapper.$inner = wrapper.$currValue;
    return wrapper;
}

/*
Specifications:

- a wrapped Function will be called, its return value stored in $currValue, then a 
    copy of the Function will be returned, available to be called immediately. 
    This is useful for repeatedly posting something to the console, creating a table of test cases,
    or repeatedly mutating an object--basically, any function whose return value isn't needed.
    
    examples:
    console.log("foo");
    console.log(obj1.props.length / 2);
    console.log(37);

    ___(console.log)
    ("foo")
    (obj1.props.length / 2)
    (37);

    assertEqual(arr1.length, 5);
    assertEqual(arr1[0], "Christmas");
    assertEqual(arr1[3], "Halloween");
    assertEqual(foo(5),  [1, 2, 3, 4, 5]);

    ___(assertEqual)
    (arr1.length,   5)
    (arr1[0],       "Christmas")
    (arr1[3],       "Halloween")
    (foo(5),        [1, 2, 3, 4, 5]);

    //=========

    function hideProperty(obj, field) {
        var spliced = obj[field];
        obj[field] = "secret!";
        return spliced;
    }

    var myObj = {
        one: 1,
        two: 2,
        three: 3
    }

    // $currValue stores the actual return value of the last operation
    ___(hideProperty)
    (myObj, "one")
    (myObj, "two")
    (myObj, "three").$currValue; // 3

    myObj; // {"one": "secret!", "two": "secret!", "three": "secret!" }


- if toString() or valueOf() are implicitly or explicitly called upon
    the wrapper, these methods will be called upon $currValue, not $inner.
    This allows the programmer to log the result ("actual return value") 
    of operations without directly accessing $currValue

- In short, at any time, the wrapper may work in three ways:
    1. As a Function which may be immediately invoked to call the previous method again
    2. As an Object with access to all properties and methods of the wrapped object
    3. As the primitive value returned from the previous method (rather than a complex 
        function which cannot be read in any simple way)
*/


// if the method is a duplicate you have to call it through $inner.length
//    should behave different for immutable data types(?)
//    or maybe just only work for mutables
//    for immutables, just return the return value, but allow its methods to be chained

// ideally, the toString() and valueOf() would return $inner or $currValue, not a functin

// for wrapping any (non-native) objects to make the methods chainable by 
//     returning the wrapper after every method call
// to get the "real" return value from the wrapper after a method 
//     call, access wrapper.$currValue 
// all methods mutate the original object, so there's no need to unwrap it, 
//     however, you can call wrapper.$inner to return the object
// will not overwrite fields already in Function, so watch out for length, name
function wrap(obj) {
    var wrapper = function() { return wrapper[wrapper.$currMethod].apply(wrapper, arguments) }

    Object.defineProperty(wrapper, "$ref", {
        value: obj,
        writable: false
    });

    // private fields
    wrapper.$isWrapper = true;
    wrapper.$currValue = wrapper.$ref;
    wrapper.$currMethod = "$pass";
    wrapper.$currArgs = [];
    wrapper.$pass = function(targetObj) { 
        var result = targetObj || wrapper.$currValue;

        wrapper.$currArgs = [];
        wrapper.$currMethod = "$pass";
        wrapper.$currValue = wrapper.$ref;
        
        if (result == null)              throw new TypeError("Cannot pass to an undefined return value.");
        else if (result == wrapper.$ref) return wrapper;
        else                             return ___(result);
    }
    wrapper.$unwrap = function() { return wrapper.$ref }
    wrapper.$val = function() { return wrapper.$currValue }
    wrapper.$do = function(fn) {
            var args = Array.prototype.slice.call(arguments);
            args[0] = wrapper;

            wrapper.$currArgs = arguments;
            wrapper.$currMethod = "$do";
            wrapper.$currValue = fn.apply(this, args);

        return wrapper;
    }
    
    // public methods
    wrapper.pass = wrapper.$pass;
    wrapper.unwrap = wrapper.$unwrap;
    wrapper.val = wrapper.$val;
    wrapper.do = wrapper.$do;
    wrapper.toString = function() { return wrapper.$currValue.toString() }
    wrapper.valueOf = function() { return wrapper.$currValue }


/*     wrapper.$chainTypeError = function() {
        throw new TypeError("Chaining forbidden. Method signature for immutable types must be [T -> T]");
    } */


    var fields = getAllProperties(obj);
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        if (obj[field] instanceof Function) {
            addWrappedMethod(field);
        } else if (obj.hasOwnProperty(field)) {
            addWrappedProperty(field);
        }
    }

    function addWrappedMethod(name) {
        if (name !== "toString" && name !== "valueOf") {
            wrapper[name] = function() {
                var args;
                if (wrapper.$currMethod == name && !arguments.length) {
                    args = wrapper.$currArgs;
                } else {
                    args = arguments;
                    wrapper.$currMethod = name;
                    wrapper.$currArgs = args;
                }
                wrapper.$currValue = obj[name].apply(obj, args);
                return wrapper;
            }
        }
    }

    function addWrappedProperty(name) {
        if (wrapper[name] == null) {
            Object.defineProperty(wrapper, name, {
                configurable: true,
                get: function() { return obj[name] },
                set: function(val) { obj[name] = val }
            });
        }
    }

    return wrapper;
}

var obj1 = {
    lengths: 5,
    names: "Sal",
    lengthen: function() {
        this.lengths++;
    },
    shrink: function() {
        this.lengths--;
    },
    add: function(n) {
        this.lengths += n;
        return "gotcha!";
    },
    inner: {
        a: "nice cuppa",
        b: "yummy cuppa",
        c: 56
    }
}

//wrapped.takeProperties(obj1);
var wrapped = ___(obj1);

function isLongObject(obj) {
    return obj.length > 10;
}

// test function capabilities, overwritten method names
function test() {
    log.post(wrapped.lengthen()()()()
                    .shrink()()
                    .add(0.33)()()()
                    .do(isLongObject)
                    .val());

    ___(log.post)
    (wrapped.$currMethod)
    (wrapped.$currValue)
    (wrapped.lengths)
    (wrapped.names)
    (wrapped.inner.a);

    wrapped.lengths = wrapped.lengths / 2;

    log.post("*******TESTS**********");

    ___(assertEqual)
    (obj1.lengths, wrapped.lengths)
    (obj1.names, wrapped.names)
    (obj1, wrapped.unwrap());

    wrapped.names = "greggo";

    log.post(JSON.stringify(obj1));

    ___(log.post)
    (wrapped.inner.a) // "nice cuppa"
    (obj1.inner.b)    // "yummy cuppa"
    (wrapped.inner.c) // 56
    (___([5, 12, 73, 8, 9])
        .splice(1, 0)
        .push(0.2)()()()()
        .sort()
        .unwrap())
    (wrapped);

    var myObject = {
        value: 4,
        add: function(n) { this.value += (n || 0.1) },
        getValue: function() { return this.value }
    }

    /* 
    ___(___(myObject)); // No error, just has no effect
    ___(myObject).add()().pass(); // TypeError: Cannot pass to an undefined return value.
    ___("heyo"); // TypeError: Immutable types cannot be wrapped.
    ___(myObject).getValue().pass(); // TypeError: Immutable types cannot be wrapped.
    ___(myObject).pass("hihi"); // TypeError: Immutable types cannot be wrapped.
     */
    
    var a = ___(myObject).add(4)(5)()()().unwrap();
    assertEqual(myObject, a); // myObject has been mutated

    myObject.value = 0;
    ___(myObject).add();
    assertEqual(myObject.value, 0.1);

    myObject.value = 0;
    ___(myObject).add(1);
    assertEqual(myObject.value, 1);

    myObject.value = 0;
    ___(myObject).add(100)()()()()()()();
    assertEqual(myObject.value, 800);
    
    var a = ___(myObject);
    var b = a();
    var c = a.pass();
    
    var d = ___(myObject).pass(obj1).unwrap();
    var e = ___(obj1).unwrap();
    
    assertEqual(a, b);
    assertEqual(b, c);
    assertEqual(d, e);
}

export___;