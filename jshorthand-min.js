module.exports=function e(t){if(t instanceof Object){if(t.$_isWrapper)return t;{const r={get:function(e,n){return"toString"==n||"valueOf"==n?()=>e.$_method.val[n]():void 0!==e.$_ref[n]?e.$_ref[n]instanceof Function?function(e,n){return(...r)=>(e.$_method.name!==n?e.$_method.save(n,r,t[n].apply(t,r)):0===r.length?o.$_method.reapply():o.$_method.reapply(r),a)}(e,n):e.$_ref[n]:void 0!==e.$_method.val[n]?e.$_method.val[n]:e[n]},set:()=>{throw new Error("Forbidden. Use set() to set inner object fields.")}},o=function(...e){return a[o.$_method.name].apply(o,e)},a=new Proxy(o,r);o.$_ref=t,o.$_isWrapper=!0,o.$_method={save:function(e,t,n=this.val){this.name=e,this.args=t,this.val=n},val:t,name:t instanceof Function?"$_ref":"$_pass",args:[],reapply:function(e=this.args){this.save(this.name,e,t[this.name].apply(t,e))}},o.$_pass=function(t=o.$_method.val){if(o.$_method.save("$_pass",[],o.$_ref),null==t)throw new TypeError("Cannot pass to an undefined return value.");return t==o.$_ref?a:e(t)},o.$_do=function(e,...t){return t.unshift(o.$_ref),o.$_method.save("$_do",[],e.apply(o.$_ref,t)),a},o.$_set=function(e,t){o.$_method.save("$_set",[],t);let r=o.$_publicMethodNames,s=r.indexOf(e);if(~s){let t="$"+e;n(e,t),o[t]=o[e],o[e]=void 0,r[s]=t}return o.$_ref[e]=t,a},o.$_unwrap=(()=>o.$_ref),o.$_val=(()=>o.$_method.val),o.$_publicMethodNames=["pass","unwrap","val","do","set"];let s=o.$_publicMethodNames;for(let e=0;e<s.length;e++){let r=s[e],a=r;if(r in t){do{a="$"+a}while(a in t);n(r,a)}o[a]=o["$_"+r],s[e]=a}function n(e,t){console.warn&&console.warn("JShorthand: The wrapper method '"+e+"()' has been renamed '"+t+"()'")}return a}}throw new TypeError("Primitive types cannot be wrapped.")};