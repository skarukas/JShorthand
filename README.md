# wrapper-chain

Allows syntactical chaining of JavaScript objects and functions with a simple wrapper.
Designed to make repeated calls to mutator methods (or other methods with unimportant return values) simpler.

# Syntactical Use Cases

```javascript
var myArr = [0, 1, 2];
myArr.push(3);
myArr.push(4);
myArr.push(5);
```
becomes
```javascript
var myArr = [0, 1, 2];
makeWrapper(myArr).push(3)(4)(5);
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
        else throw new Error("Test Failed. " + input + " != " + expect);
    }
    return inner;
}

var myFuncTest = myCurriedAssertFunction(myFunc);

makeWrapper(myFuncTest)
    (/* input */,            /* expectedOutput */)
    (/* input */,            /* expectedOutput */)
    (/* input */,            /* expectedOutput */)
    (/* input */,            /* expectedOutput */);
```

```javascript
makeWrapper(myObject)
    .myMethod
    (/* ...args */)
    (/* ...args */)
    .myOtherMethod          // this method returns a different object
    (/* ...args */)
    (/* ...args */)
    .pass()                 // now, calls refer to the new object (wrapped)
    .otherObjectsMethod     
    (/* ...args */)
    (/* ...args */)
    .val();                 // the return value of otherObjectsMethod(), unwrapped
```
