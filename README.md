# wrapper-chain

===== Syntactical Use Cases =====
```javascript
chain(myFunction)
    (/* first call */)
    (/* second call */)
    (/* third call */)
    (/* fourth call */);

chain(myFunction)
    (/* first call */)
    ()  // first call repeated with those arguments
    ()  // first call repeated with those arguments
    (); // first call repeated with those arguments

//The assumption here is that myCurriedAssertFunction() takes a function as input 
//    and returns another function, verifying the input argument produces the expected result.
chain(myCurriedAssertFunction(myFunc))
    (/* input */,            /* expectedOutput */)
    (/* input */,            /* expectedOutput */)
    (/* input */,            /* expectedOutput */)
    (/* input */,            /* expectedOutput */);

chain(myObject)
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
