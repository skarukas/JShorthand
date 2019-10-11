(function() {
    const ___ = require("../jshorthand");
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

    // making sure argument from previous method doesn't transfer over
    newLen = (wrapped.length - 6) + 2;
    wrapped.shrink(2)()().lengthen()();
    Assert.equal(wrapped.length, newLen);

    // repeated calling, changing arguments
    newLen = (wrapped.length - 7) + 4;
    wrapped.shrink(3)(4).lengthen(2)(0)()(1)();
    Assert.equal(wrapped.length, newLen);

    wrapped.nothing().val()
    // val() returns last returned value
    Assert.equal(wrapped.nothing().val(), "nothing");

    // implicit toString() returns String value of last returned value
    Assert.equal(wrapped.nothing(), "nothing");

    // using method calls of the last returned value
    Assert.equal(wrapped.nothing().substring(2, 6), "thin");
    Assert.equal(wrapped.nothing()[3], "h");

    // implicit valueOf() returns numeric value of last returned value
    Assert.equal(wrapped.self(), 4);

    // callbacks with do()
    newLen = wrapped.length + 4;
    Assert.equal(wrapped.lengthen()()()()
                    .do(function() { this.length === newLen })
                    .val(),
                true);

    const fakeError = new Error("Didn't throw a real error!");

    // object properties cannot be set
    try {
        wrapped.length = 5;
        throw fakeError;
    } catch (e) {
        Assert.equal(e.message, "Forbidden. Use set() to set inner object fields.");
    }

    // primitives cannot be wrapped
    try {
        ___("I'm a string");
        throw fakeError;
    } catch (e) {
        Assert.equal(e.message, "Primitive types cannot be wrapped.");
    }

    // cannot pass to undefined return value
    try {
        wrapped.pass(null);
        throw fakeError;
    } catch (e) {
        Assert.equal(e.message, "Cannot pass to an undefined return value.");
    }

    const myObject = {
        value: 4,
        val: 32,
        do: 32,
        $val: 32,
        add: function(n) { this.value += (n || 0.1) },
        getValue: function() { return this.value }
    }
    let newWrap = ___(myObject);
    let unwrapped = newWrap.add(4)(5)()()().ref;
    Assert.equal(myObject, unwrapped); // myObject has been mutated
    
    let a = newWrap;
    let b = a();
    let c = a.pass();
    
    let d = newWrap.pass(o).ref;
    let e = ___(o).ref;


    ___(Assert.equal)(a, b);

    ___(Assert.equal)
        (a, b)
        (b, c)
        (d, e);


    newWrap.set("value", 69)
                ("set", "setttt")
                ("name", "sally")
            .$set("val", 31);

    ___(Assert.equal)
        (myObject.value, 69)
        (myObject.set, "setttt")
        (myObject.name, "sally")
        (myObject.val, 31);
})();