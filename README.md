# wrapper-chain

Allows chaining of JavaScript objects and functions with a simple wrapper; designed to make repeated calls to mutator methods (or other methods with unimportant return values) more syntactically elegant.

# Syntactical Use Cases
Modifying an array:
```javascript
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
```
becomes
```javascript
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
In this case, `pass()` transfers the wrapper from `myObject` to the object returned by the second call to `myObject.myOtherMethod()`.
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

"public" name               "private" alias               description

`Wrapper.pass(targetObj?)`    `Wrapper.$pass(targetObj?)`   returns the wrapped (if possible) return value of the last function, `$currValue`
                                                            -If `targetObj` is specified, it will be wrapped instead of the last return value 
                                                            -For clearer syntax, specifying `targetObj` should generally 
                                                                be avoided in favor of a separate statement
`Wrapper.val()`               `Wrapper.$val()`              returns `$currValue`, the (unwrapped) return value of the last function
`Wrapper.unwrap()`            `Wrapper.$unwrap()`           returns `$ref`, the inner object
                                                            -The object is stored by reference, so `unwrap()` isn't necessary in most cases
`Wrapper.do(fn, ...args?)`    `Wrapper.$do(fn, ...args?)`   calls `fn` with `Wrapper` as its first argument and `args` as the rest

property                initial value           description

- `Wrapper.$currMethod`     `"$pass"`                 The name of the last called method
- `Wrapper.$ref`            `obj` (input)             A reference to the object being wrapped; immutable
- `Wrapper.$currValue`      `obj` (input)             The value returned by the last function
- `Wrapper.$currArgs`       `[]`                      The last arguments passed to `$currMethod`


handling 

- `makeWrapper(myObj)()` calls `$pass()`, see below
- `makeWrapper(myObj).pass()` returns the wrapper if no arguments are specified
- `makeWrapper(myObj).val()` returns the inner object, like `$unwrap()`
