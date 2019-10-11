module.exports = function makeWrapper(obj, thisArg = obj) {
    if (!(obj instanceof Object)) throw new TypeError("Primitive types cannot be wrapped.");
    else if (obj.$_isWrapper) return obj;
    // create Proxy handler
    const HANDLER = {
        get: function(target, name) {
            if (name == "toString" || name == "valueOf") return () => methodCommand.val[name]();
            else {
                /*  1. search in the wrapped object
                    2. search in the last returned object (breaks the chain) 
                    3. search in the wrapper */
                return (target.$_ref[name] !== undefined)?      chainMethod(target.$_ref[name]) 
                     : (methodCommand.val[name] !== undefined)? methodCommand.val[name]
                     : chainMethod(target[name]);

                function chainMethod(prop) {
                    if (!(prop instanceof Function) || prop === target.$_val || prop === target.$_pass) return prop;
                    // store prop if it's a chainable method
                    methodCommand.setFn(prop);
                    return publicProxy;
                }
            }
        },
        set: () => { throw new Error("Forbidden. Use set() to set inner object fields."); }
    },
    callableWrapper = function(...args) { 
        methodCommand.reapply(args);
        return publicProxy;
    },
    methodCommand = {
        val: obj,
        args: [],
        fn: (obj instanceof Function)? obj : callableWrapper.$_pass,
        publicNames: ["pass", "ref", "val", "do", "set"],
        
        save: function(fn, args, val = this.val) {
            this.fn = fn;
            this.args = args;
            this.val = val;
        },
        setFn: function(fn) {
            this.fn = fn;
            this.args = [];
        },
        reapply: function(newArgs) {
            if (newArgs.length === 0) newArgs = this.args;
            this.save(this.fn, newArgs, this.fn.apply(thisArg, newArgs));
        },
    },
    publicProxy = new Proxy(callableWrapper, HANDLER);

    // private fields
    callableWrapper.$_ref = obj;
    callableWrapper.$_isWrapper = true;

    // private methods
    callableWrapper.$_pass = function(targetObj = methodCommand.val) {       
        if      (targetObj == null)                  throw new TypeError("Cannot pass to an undefined return value.");
        else if (targetObj == callableWrapper.$_ref) return publicProxy;
        else                                         return makeWrapper(targetObj);
    }

    callableWrapper.$_do = (fn, ...args) => fn.apply(obj, args);
    callableWrapper.$_val = () => methodCommand.val;

    callableWrapper.$_set = function(name, value) {
        aliasName(name);
        callableWrapper.$_ref[name] = value;
        return value;
    }

    function aliasName(name) {
        let names = methodCommand.publicNames;
        let index = names.indexOf(name);
        if (~index) {
            let alias = "$" + name;
            renameWarning(name, alias);
            callableWrapper[alias] = callableWrapper[name];
            delete callableWrapper[name];
            names[index] = alias;
        }
    }
    // create public methods, making aliases if necessary
    let names = methodCommand.publicNames;
    for (let i = 0; i < names.length; i++) {
        let name = names[i], alias = name;
        if (name in obj) {
            do { alias = "$" + alias } while (alias in obj);
            renameWarning(name, alias);
        }
        callableWrapper[alias] = callableWrapper["$_" + name];
        names[i] = alias;
    }

    function renameWarning(name, alias) {
        console.warn && console.warn("JShorthand: The wrapper method '" + name + "()' has been renamed '" + alias + "()' due to a name collision");
    }

    return publicProxy;
}