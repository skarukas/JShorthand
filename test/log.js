//const maxApi = require("max-api");
module.exports = {
    post: function(str) {
        this.printStream(str);
    },
    printStream: console.log,
    arr: [],
    add: function(str, type) {
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
        this.arr.push(str);
    },
    clear: function() {
        this.arr = [];
    },
    print: function() {
        this.printStream("    # =========== STATEMENT LOG ===========");
        for (var i = 0; i < this.arr.length; i++) {
            this.printStream("    #    " + this.arr[i]);
        }
    }
}