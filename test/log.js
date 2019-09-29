//const maxApi = require("max-api");
let arr = [];
let printStream = console.log;

exports.post = function(str) {
    printStream(str);
}

exports.add = function(str, type) {
    switch(type) {
        case "bullet": 
            str = "    - " + str;
            break;
        case "action": 
            str = "    <<< " + str + " >>>";
            break;
        case "header":
            str = "===== " + str + " =====";
            break;
        case "error":
            str = "****** " + str + " ******";
        default:
    }
    arr.push(str);
}

exports.clear = function() {
    arr = [];
}

exports.print = function() {
    printStream("    # =========== STATEMENT LOG ===========");
    for (var i = 0; i < arr.length; i++) {
        printStream("    #    " + arr[i]);
    }
}