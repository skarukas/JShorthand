# JShorthand
A lightweight ES6 JavaScript library enabling a clean and flexible syntax for performing a set of object 
mutations or function calls in only one statement. 

Wrapping an object with the JShorthand function (imported as `____()`) allows a series of mutator methods to be directly chained. In addition, the object's methods (and the object itself if it is a function) may be immediately recalled:
```javascript
const ____ = require("jshorthand");

____(myObj)
    .myMutatorFunctionOne()
    .myMutatorFunctionTwo
      (args1)
      (args2)
      (args3)
    .myMutatorFunctionThree();
    
____(myFunc)
    (args1)
    (args2)
    (args3;

    

```


See "Wiki" for more use cases and documentation.
