module.exports = function makeWrapper(obj) {
    // can't wrap wrappers or primitives
    if (!(obj instanceof Object)) throw new TypeError("Primitive types cannot be wrapped.");
    else if (obj.$_isWrapper) return obj;
        
    else { 
        // create Proxy handler
        const HANDLER = {
            get: function(target, name) {
                if (name == "toString" || name == "valueOf" ) return () => target.$_method.val[name]();
                else {
                    /* 1. search in the wrapped object
                       2. search in the last returned object (breaks the chain)
                       3. search in the wrapper */
                    if (target.$_ref[name] !== undefined) {
                        return (target.$_ref[name] instanceof Function)? callInnerMethod(target, name) : target.$_ref[name];
                    } else if (target.$_method.val[name] !== undefined) { 
                        return target.$_method.val[name];
                    } else {
                        return target[name];
                    }
                }
            },
            set: () => { throw new Error("Forbidden. Use set() to set inner object fields."); }
        },
        CALLABLE_WRAPPER = function(...args) { return PUBLIC_PROXY[CALLABLE_WRAPPER.$_method.name].apply(CALLABLE_WRAPPER, args) },
        PUBLIC_PROXY = new Proxy(CALLABLE_WRAPPER, HANDLER);
    
        function callInnerMethod(target, name) {
            return (...args) => {
                // name is the name of the function
                if (target.$_method.name !== name) {
                    // a different method, so call it with the specified args
                    target.$_method.save(name, args, obj[name].apply(obj, args));
                } else {   
                    if (args.length === 0) { 
                        CALLABLE_WRAPPER.$_method.reapply();
                        // the same method as last time, so reapply same arguments if none have been specified
                    } else {
                        CALLABLE_WRAPPER.$_method.reapply(args);
                    }
                }

                return PUBLIC_PROXY;
            }
        }

        // private fields
        CALLABLE_WRAPPER.$_ref = obj;
        CALLABLE_WRAPPER.$_isWrapper = true;
        CALLABLE_WRAPPER.$_method = {
            save: function(name, args, val = this.val) {
                // console.log(`setting ${name}, ${args}, ${JSON.stringify(val)}`);
                this.name = name;
                this.args = args;
                this.val = val;
            },
            val: obj,
            name: (obj instanceof Function)? "$_ref" : "$_pass",
            args: [],
            reapply: function(newArgs = this.args) {
                this.save(this.name, newArgs, obj[this.name].apply(obj, newArgs))
            }
        }

        // private methods
        CALLABLE_WRAPPER.$_pass = function(targetObj = CALLABLE_WRAPPER.$_method.val) { 
            CALLABLE_WRAPPER.$_method.save("$_pass", [], CALLABLE_WRAPPER.$_ref);
            
            if      (targetObj == null)             throw new TypeError("Cannot pass to an undefined return value.");
            else if (targetObj == CALLABLE_WRAPPER.$_ref) return PUBLIC_PROXY;
            else                                    return makeWrapper(targetObj);
        }
        CALLABLE_WRAPPER.$_do = function(fn, ...args) {
            args.unshift(CALLABLE_WRAPPER.$_ref);
            CALLABLE_WRAPPER.$_method.save("$_do", [], fn.apply(CALLABLE_WRAPPER.$_ref, args));
            return PUBLIC_PROXY;
        }
        CALLABLE_WRAPPER.$_set = function(name, value) {
            CALLABLE_WRAPPER.$_method.save("$_set", [], value);

            let names = CALLABLE_WRAPPER.$_publicMethodNames;
            let index = names.indexOf(name);
            if (~index) {
                let alias = "$" + name;
                renameWarning(name, alias);
                CALLABLE_WRAPPER[alias] = CALLABLE_WRAPPER[name];
                CALLABLE_WRAPPER[name] = undefined;
                names[index] = alias;
            }
            CALLABLE_WRAPPER.$_ref[name] = value;

            return PUBLIC_PROXY;
        }
        CALLABLE_WRAPPER.$_unwrap = () => CALLABLE_WRAPPER.$_ref;
        CALLABLE_WRAPPER.$_val = () => CALLABLE_WRAPPER.$_method.val;

        // create public methods, making aliases if necessary
        CALLABLE_WRAPPER.$_publicMethodNames = ["pass", "unwrap", "val", "do", "set"];

        let names = CALLABLE_WRAPPER.$_publicMethodNames;
        for (let i = 0; i < names.length; i++) {
            let name = names[i], alias = name;
            if (name in obj) {
                do { alias = "$" + alias } while (alias in obj);
                renameWarning(name, alias);
            }
            CALLABLE_WRAPPER[alias] = CALLABLE_WRAPPER["$_" + name];
            names[i] = alias;
        }

        function renameWarning(name, alias) {
            if (console.warn) console.warn("JShorthand: The wrapper method '" + name + "()' has been renamed '" + alias + "()'");
        }

        return PUBLIC_PROXY;
    }
}