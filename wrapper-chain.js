function makeWrapper(val) {
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

// allows a function with no return value to be called repeatedly by returning itself
function chain(fn) {
    // INTEGRATE WITH WRAP
    var inner = function() {
        inner.$currValue = fn.apply(null, arguments);
        return inner;
    }
    return inner;
}

// for wrapping any (non-native) objects to make the methods chainable by 
//     returning the wrapper after every method call
// to get the "real" return value from the wrapper after a method 
//     call, wrapper.val() 
// all methods mutate the original object, so there's no need to unwrap it, 
//     however, you can call wrapper.unwrap() to return the object
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
        else                             return makeWrapper(result);
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

    var fields = getAllProperties(obj);
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        if (obj[field] instanceof Function) {
            addWrappedMethod(field);
        } else if (obj.hasOwnProperty(field)) {
            addWrappedProperty(field);
        }
    }
    return wrapper;


    // utility methods
    function getAllProperties(obj) {
        if (Object.getPrototypeOf(obj) == null) return []; // doesn't inherit the Object properties
        return Object.getOwnPropertyNames(obj).concat(getAllProperties(Object.getPrototypeOf(obj)));
    }

    function addWrappedMethod(name) {
        if (Function.hasOwnProperty(name)) name = "$" + name; // avoids "length", "name", "prototype" conflicts

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
}

module.exports = makeWrapper;