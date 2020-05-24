"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sortBy(list, mapFunction) {
    return list.sort(function (a, b) { return mapFunction(a) - mapFunction(b); });
}
exports.sortBy = sortBy;
function sortByReversed(list, mapFunction) {
    return list.sort(function (a, b) { return mapFunction(b) - mapFunction(a); });
}
exports.sortByReversed = sortByReversed;
function comparing(mapFunction) {
    return function (a, b) { return mapFunction(a) - mapFunction(b); };
}
exports.comparing = comparing;
function comparingReversed(mapFunction) {
    return function (a, b) { return mapFunction(b) - mapFunction(a); };
}
exports.comparingReversed = comparingReversed;
function average(list) {
    var sum = list.reduce(function (a, b) { return a + b; });
    return sum / list.length;
}
exports.average = average;
//# sourceMappingURL=ArrayUtils.js.map