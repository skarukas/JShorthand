module.exports = function makeWrapper(obj, thisArg = obj) {
    if (!(obj instanceof Object)) throw new TypeError("Primitive types cannot be wrapped.");
    else if (obj.$_isWrapper) return obj;
    
    // handles get/set requests to WRAPPER_FN
    const HANDLER = {
        set: () => { throw new Error("Forbidden. Use set() to set inner object fields.") },
        get: function(target /* (wrapped object) */, field) {
            if (field == "toString" || field == "valueOf") return () => COMMAND.val[field]();
            else {
                /*  1. search in the wrapped object
                    2. search in the last returned object (breaks the chain) 
                    3. search in the wrapper */
                return (target.$_ref[field] !== undefined)? chainMethod(target.$_ref[field]) 
                     : (COMMAND.val[field] !== undefined)?  COMMAND.val[field]
                     : chainMethod(target[field]);

                function chainMethod(prop) {
                    if (!(prop instanceof Function) || prop === target.$_val || prop === target.$_pass) return prop;
                    // store prop if it's a chainable method
                    COMMAND.setFn(prop);
                    return PROXY;
                }
            }
        }
    }

    const WRAPPER_FN = function(...args) { 
        COMMAND.reapply(args);
        return PROXY;
    }

    const PROXY = new Proxy(WRAPPER_FN, HANDLER);

    const COMMAND = {
        val: obj,
        args: [],
        fn: (obj instanceof Function)? obj : WRAPPER_FN.$_pass,
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
        }
    }

    // private fields
    WRAPPER_FN.$_ref = obj;
    WRAPPER_FN.$_isWrapper = true;

    // private methods
    WRAPPER_FN.$_pass = function(targetObj = COMMAND.val) {       
        if      (targetObj == null)             throw new TypeError("Cannot pass to an undefined return value.");
        else if (targetObj == WRAPPER_FN.$_ref) return PROXY;
        else                                    return makeWrapper(targetObj);
    }

    WRAPPER_FN.$_do = (fn, ...args) => fn.apply(obj, args);
    WRAPPER_FN.$_val = () => COMMAND.val;

    WRAPPER_FN.$_set = function(field, value) {
        let names = COMMAND.publicNames;
        let index = names.indexOf(field);
        if (~index) {
            let alias = "$" + field;
            renameWarning(field, alias);
            WRAPPER_FN[alias] = WRAPPER_FN[field];
            delete WRAPPER_FN[field];
            names[index] = alias;
        }
        WRAPPER_FN.$_ref[field] = value;
        return value;
    }
    
    // create public methods, making aliases if necessary
    let names = COMMAND.publicNames;
    for (let i = 0; i < names.length; i++) {
        let name = names[i], alias = name;
        if (name in obj) {
            do { alias = "$" + alias } while (alias in obj);
            renameWarning(name, alias);
        }
        WRAPPER_FN[alias] = WRAPPER_FN["$_" + name];
        // store the method name
        names[i] = alias;
    }

    function renameWarning(name, alias) {
        console.warn && console.warn(`The name '${name}' is being used within this object. The JShorthand field may still be accessed using '${alias}'.`);
        //"JShorthand: The wrapper method '" + name + "()' has been renamed '" + alias + "()' due to a name collision"
    }

    return PROXY;
}