module.exports = function makeWrapper(obj) {
    // can't wrap wrappers or primitives
    if (!(obj instanceof Object)) throw new TypeError("Primitive types cannot be wrapped.");
    else if (obj.$_isWrapper) return obj;
        
    else { 
        // create Proxy handler
        const HANDLER = {
            get: function(target, name) {
                if (name == "toString" || name == "valueOf" ) {
                    return () => target.$_currValue[name]();
                } else {
                    /* 1. search in the wrapped object
                       2. search in the last returned object (breaks the chain)
                       3. search in the wrapper */
                    if (target.$_ref[name] !== undefined) {
                        return (target.$_ref[name] instanceof Function)? callInnerMethod(target, name) : target.$_ref[name];
                    } else if (target.$_currValue[name] !== undefined) { 
                        return target.$_currValue[name];
                    } else {
                        return target[name];
                    }
                }
            },
            set: (target, property, value, receiver) => Reflect.set(target.$_ref, property, value, receiver)
        };

        const CALLABLE_WRAPPER = function(...args) { return PUBLIC_PROXY[CALLABLE_WRAPPER.$_currMethod].apply(CALLABLE_WRAPPER, args) };
        const PUBLIC_PROXY = new Proxy(CALLABLE_WRAPPER, HANDLER);
    
        function callInnerMethod(target, name) {
            return (...args) => {
                // name is the name of the function
                if (target.$_currMethod !== name) {
                    // a different method, so call it with the specified args
                    target.$_currMethod = name;
                    target.$_currArgs = args;
                } else {
                    if (args.length === 0) { 
                        // the same method as last time, so reapply same arguments if none have been specified
                        args = target.$_currArgs;
                    } else {
                        target.$_currArgs = args;
                    }
                }
                // call the method with the specified arguments and store the result
                target.$_currValue = obj[name].apply(obj, args) || target.$_currValue;

                return PUBLIC_PROXY;
            }
        }

        // private fields
        CALLABLE_WRAPPER.$_ref = obj;
        CALLABLE_WRAPPER.$_isWrapper = true;
        CALLABLE_WRAPPER.$_currValue = CALLABLE_WRAPPER.$_ref;
        CALLABLE_WRAPPER.$_currMethod = (obj instanceof Function)? "$_ref" : "$_pass";
        CALLABLE_WRAPPER.$_currArgs = [];
        CALLABLE_WRAPPER.toString = CALLABLE_WRAPPER.$_currValue.toString;
        CALLABLE_WRAPPER.valueOf = CALLABLE_WRAPPER.$_currValue.valueOf;

        // private methods
        CALLABLE_WRAPPER.$_pass = function(targetObj = CALLABLE_WRAPPER.$_currValue) { 
            CALLABLE_WRAPPER.$_currArgs = [];
            CALLABLE_WRAPPER.$_currMethod = "$_pass";
            CALLABLE_WRAPPER.$_currValue = CALLABLE_WRAPPER.$_ref;
            
            if      (targetObj == null)             throw new TypeError("Cannot pass to an undefined return value.");
            else if (targetObj == CALLABLE_WRAPPER.$_ref) return PUBLIC_PROXY;
            else                                    return makeWrapper(targetObj);
        }
        CALLABLE_WRAPPER.$_do = function(fn, ...args) {
            CALLABLE_WRAPPER.$_currArgs = [];
            CALLABLE_WRAPPER.$_currMethod = "$_do";
            args.unshift(CALLABLE_WRAPPER.$_ref);
            CALLABLE_WRAPPER.$_currValue = fn.apply(CALLABLE_WRAPPER.$_ref, args) || CALLABLE_WRAPPER.$_currValue;
            return PUBLIC_PROXY;
        }
        CALLABLE_WRAPPER.$_unwrap = () => CALLABLE_WRAPPER.$_ref;
        CALLABLE_WRAPPER.$_val = () => CALLABLE_WRAPPER.$_currValue;
        
        // create public methods, making aliases if necessary
        const publicMethodNames = ["pass", "unwrap", "val", "do"];
        for (let methodName of publicMethodNames) {
            let alias = methodName;
            if (alias in obj) {
                do { alias = "$" + alias } while (alias in obj);
                if (console.warn) console.warn("The wrapper method '" + methodName + "()' creates a collision and has been renamed '" + alias + "()'");
            }
            CALLABLE_WRAPPER[alias] = CALLABLE_WRAPPER["$_" + methodName];
        }

        return PUBLIC_PROXY;
    }
}