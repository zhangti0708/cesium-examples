// case 1 create calc obj and attach to the globe(window)
(function() {
    var subtract = function (a, b) {
        return a - b;
    };
    var add = function (a, b) {
        return a + b;
    };
    this.calc = {
        subtract: subtract,
        add: add
    };
}(this));

// (function() {
//     var subtract = function (a, b) {
//         return a - b;
//     };
//     var add = function (a, b) {
//         return a + b;
//     };
//     this.calc = {
//         subtract: subtract,
//         add: add
//     };
// }).call(this);

// case 2 return the function directly
// function calc(a,b){
//     return a+b;
// }