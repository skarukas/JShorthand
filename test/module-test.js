(function() {
    const ___ = require("../wrapper-chain");
    const Assert = require("./assert");
    const Log = require("./log");

    const p = {
        valueOf : () => 4,
    }
    const o = {
        valueOf: () => 4,
        length: -1,
        name: "Sal",
        lengthen: function(n = 1) {
            o.length += n;
            return true;
        },
        shrink: function(n = 1) {
            o.length -= n;
            return false;
        },
        nothing: () => "nothing",
        self: () => o,
        inner: {
            a: "a",
            b: "b",
            c: "c"
        }
    }
    const wrapped = ___(o);

    // length and name access the object's, not the Function's
    Assert.equal(wrapped.length, -1);
    Assert.equal(wrapped.name, "Sal");

    let newLen;
    // repeated calling, no argument
    newLen = wrapped.length + 5;
    wrapped.lengthen()()()()();
    Assert.equal(wrapped.length, newLen);

    // repeated calling, no argument
    newLen = wrapped.length - 4;
    wrapped.shrink()()()();
    Assert.equal(wrapped.length, newLen);

    // repeated calling, specified argument
    newLen = (wrapped.length - 6) + 9;
    wrapped.shrink(2)()().lengthen(3)()();
    Assert.equal(wrapped.length, newLen);

    // repeated calling, changing arguments
    newLen = (wrapped.length - 7) + 4;
    wrapped.shrink(3)(4).lengthen(2)(0)()(1)();
    Assert.equal(wrapped.length, newLen);

    // val() returns last returned value
    Assert.equal(wrapped.nothing().val(), "nothing");

    //console.log("wrapped.nothing().toString is " + typeof wrapped.nothing().toString);

    // implicit toString() returns String value of last returned value
    Assert.equal(wrapped.nothing(), "nothing");

    // implicit valueOf() returns numeric value of last returned value
    Assert.equal(wrapped.self(), 4);

    // callbacks with do()
    newLen = wrapped.length + 4;
    Assert.equal(wrapped.lengthen()()()()
                    .do((obj) => obj.length === newLen)
                    .val(),
                true);


    const myObject = {
        value: 4,
        val: 32,
        do: 32,
        $val: 32,
        add: function(n) { this.value += (n || 0.1) },
        getValue: function() { return this.value }
    }
    let newWrap = ___(myObject);
    let unwrapped = newWrap.add(4)(5)()()().unwrap();
    Assert.equal(myObject, unwrapped); // myObject has been mutated
    
    let a = newWrap;
    let b = a();
    let c = a.pass();
    
    let d = newWrap.pass(o).unwrap();
    let e = ___(o).unwrap();
    
    Assert.equal(a, b);
    Assert.equal(b, c);
    Assert.equal(d, e);

/* 
    ___(Log.post)
    (wrapped.$currMethod)
    (wrapped.$currValue)
    (wrapped.lengths)
    (wrapped.names)
    (wrapped.inner.a);

    wrapped.lengths = wrapped.lengths / 2;

    Log.post("*******TESTS**********");

    ___(Assert.equal)
    (o.lengths, wrapped.lengths)
    (o.names, wrapped.names)
    (o, wrapped.unwrap());

    wrapped.names = "greggo";

    Log.post(JSON.stringify(o));

    ___(Log.post)
    (wrapped.inner.a) // "nice cuppa"
    (o.inner.b)    // "yummy cuppa"
    (wrapped.inner.c) // 56
    (___([5, 12, 73, 8, 9])
        .splice(1, 0)
        .push(0.2)()()()()
        .sort()
        .unwrap())
    (wrapped);
 */


    /* 
    ___(___(myObject)); // No error, just has no effect
    ___(myObject).add()().pass(); // TypeError: Cannot pass to an undefined return value.
    ___("heyo"); // TypeError: Immutable types cannot be wrapped.
    ___(myObject).getValue().pass(); // TypeError: Immutable types cannot be wrapped.
    ___(myObject).pass("hihi"); // TypeError: Immutable types cannot be wrapped.
     */
    

})();