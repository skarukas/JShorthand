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
function wrap(obj) {
    const handler = {
        // add apply functionalities
        get: function(target, name) {
            if (name == "toString") {
                //console.log("toString() called: " + target.____currValue.toString());
                return function() {
                    return target.____currValue.toString();
                }
            } else if (name == "valueOf") {
                //console.log("valueOf() called: " + target.____currValue.valueOf());
                return function() {
                    return target.____currValue.valueOf();
                }
            } else {

                if (target.____ref[name] !== undefined) {
                    // 1. search for the field in the wrapped object
                    if (typeof target.____ref[name] == "function") {
                        
                        // return the function which, once called, returns the Proxy
                        // note that methods cannot be safely passed as data if retrieved from a wrapper
                        return function(...args) {
                            
                            // name is the name of the function
                            if (target.____currMethod !== name) {
                                // a different method, so call it with the specified args
                                target.____currMethod = name;
                                target.____currArgs = args;
                                //console.log("defaulting to " + target.____currMethod + "(" + target.____currArgs + ")");
                            } else {
                                if (args.length === 0) { 
                                    // the same method as last time, so reapply same arguments if none have been specified
                                    args = target.____currArgs;
                                } else {
                                    target.____currArgs = args;
                                }
                            }
                            //console.log(name + "(" + args + ")");
                            // call the method with the specified arguments and store the result
                            target.____currValue = obj[name].apply(obj, args) || target.____currValue;

                            return wrapper;
                        }
                    } else {
                        // return the property of the inner object
                        return target.____ref[name];
                    }

                } else if (target.____currValue[name] !== undefined) { 
                    // 2. search in the last returned object

                    // Note that this simply accesses the property or calls the method, breaking the chain
                    return target.____currValue[name];
                } else {
                    // 3. search in the wrapper

                    return target[name];
                }
            }
        },
        set: function(target, property, value, receiver) {
            // set() is forwarded to the inner object
            return Reflect.set(target.____ref, property, value, receiver);
        }
    };
    const callable = function(...args) { return wrapper[callable.____currMethod].apply(callable, args) };
    const wrapper = new Proxy(callable, handler);


    // private fields
    callable.____ref = obj;
    callable.____isWrapper = true;
    callable.____currValue = callable.____ref;
    callable.____currMethod = "____pass";
    callable.____currArgs = [];
    callable.toString = callable.____currValue.toString;
    callable.valueOf = callable.____currValue.valueOf;

    // private methods
    callable.____pass = function(targetObj = callable.____currValue) { 

        callable.____currArgs = [];
        callable.____currMethod = "____pass";
        callable.____currValue = callable.____ref;
        
        if      (targetObj == null)          throw new TypeError("Cannot pass to an undefined return value.");
        else if (targetObj == callable.____ref) return wrapper;
        else                                 return makeWrapper(targetObj);
    }
    callable.____unwrap = () => callable.____ref;
    callable.____val = () => callable.____currValue;
    callable.____do = function(fn, ...args) {
        callable.____currArgs = [];
        callable.____currMethod = "____do";
        args.unshift(callable.____ref);
        callable.____currValue = fn.apply(callable.____ref, args) || callable.____currValue;
        return wrapper;
    }
    
    // create public methods, making aliases if necessary
    const public = ["pass", "unwrap", "val", "do"];
    for (let methodName of public) {
        let alias = methodName;
        if (alias in obj) {
            do { alias = "$" + alias } while (alias in obj);
            if (console.log) console.log("Warning: The wrapper method '" + methodName + "()' creates a collision and has been renamed '" + alias + "()'");
        }
        callable[alias] = callable["____" + methodName];
    }
    return wrapper;
}

module.exports = makeWrapper;