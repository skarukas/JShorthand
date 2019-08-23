A small bit of code that allows chaining of JavaScript objects and functions with a simple wrapper; designed to make repeated calls to mutator methods (or other methods with unimportant return values) more syntactically elegant.

# Syntactical Use Cases
Modifying an array:
```javascript
// vanilla javascript
var myArr = [6, 1, 2];
myArr.push(9);
myArr.push(4);
myArr.push(3);
myArr.push(0.1);
myArr.push(0.1);
myArr.push(0.1);
myArr.sort();
myArr.splice(0, 2);
console.log(myArr); // [0.1, 1, 2, 3, 4, 6, 9]

// with wrapper
var myArr = [6, 1, 2];
makeWrapper(myArr)
    .push(9)(4)(3)(0.1)()()
    .sort()
    .splice(0, 2);
console.log(myArr); // [0.1, 1, 2, 3, 4, 6, 9]
```

Logging many messages:
```javascript
makeWrapper(console.log)
    ("First Message")
    ("Second Message")
    ("Third message");
    
// output:
// First Message
// Second Message
// Third Message
```

Repeatedly calling a function with the same arguments:
```javascript
makeWrapper(console.log)("Hello, World")()();

// output:
// Hello, World
// Hello, World
// Hello, World
```

Creating a table of test cases:
```javascript
// takes a function as input and returns another function to be 
//    immediately called with input and expected result as arguments
function myCurriedAssertFunction(fn) {
    var inner = function(input, expect) {
        if (fn.apply(this, input) === expect) return;
        else throw new Error("Test failed. " + input + " != " + expect);
    }
    return inner;
}

function add1(n) {
    return n + 1;
}

var addTest = myCurriedAssertFunction(add1);
makeWrapper(addTest)
    (1034,            1035)
    (34812,           34813)
    (19.5,            20.5)
    (23,              22)  // Error: Test failed. 23 != 22
    (34,              35); // not executed
```
### Object example with built in wrapper methods
In this code, `pass()` transfers the wrapper from `myObject` to the object returned by the second call to `myObject.myOtherMethod()`.
```javascript
makeWrapper(myObject)
    .myMethod
    (/* ...args */)
    (/* ...args */)
    .myOtherMethod     // this method returns a different object
    (/* ...args */)
    (/* ...args */)
    .pass()            // now, calls refer to the object returned from myOtherMethod()
    .otherObjectsMethod     
    (/* ...args */)
    (/* ...args */)
    .val();            // the return value of otherObjectsMethod(), (unwrapped)
```
# Documentation

## public `Wrapper` class methods*
#### `.pass(targetObj?)`
Returns the wrapped (if possible) return value of the last function, `$currValue`. If `targetObj` is specified, it will be wrapped instead of the last return value. However, beginning a separate wrapping statement is probably syntactically clearer.
#### `.val()`
Returns `$currValue`, the (unwrapped) return value of the last function.
#### `.unwrap()`
Returns `$ref`, the inner object. The object is stored by reference, so `unwrap()` is not usually necessary.
#### `.do(fn, ...args?)`
Calls `fn` with `Wrapper` as its first argument and `args` as the rest.
## private fields
#### `.$currMethod`
The name of the last called method. Initialized to `"$pass"`                 
#### `.$ref`
A reference to the object being wrapped; immutable.
#### `.$currValue`
The value returned by the last function. Initialized to `$ref`.
#### `.$currArgs`
The last arguments passed to `$currMethod`.Initialized to `[]`.
#### `.$pass()`
alias for `pass()`.
#### `.$val()`
alias for `val()`.
#### `.$unwrap()`
alias for `unwrap()`.
#### `.$do()`
alias for `do()`.

The initialized values listed above result in the following "edge-cases":
- `makeWrapper(myObj)()` calls `$pass()`, see below.
- `makeWrapper(myObj).pass()` returns the wrapper, assuming no arguments are specified.
- `makeWrapper(myObj).val()` returns $ref, the inner object.
