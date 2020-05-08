function sortBy(list, mapFunction) {
    return list.sort(function (a, b) { return mapFunction(a) - mapFunction(b); });
}
function sortByReversed(list, mapFunction) {
    return list.sort(function (a, b) { return mapFunction(b) - mapFunction(a); });
}
function comparing(mapFunction) {
    return function (a, b) { return mapFunction(a) - mapFunction(b); };
}
function comparingReversed(mapFunction) {
    return function (a, b) { return mapFunction(b) - mapFunction(a); };
}
function average(list) {
    var sum = list.reduce(function (a, b) { return a + b; });
    return sum / list.length;
}
export { sortBy, sortByReversed, comparing, comparingReversed, average };
//# sourceMappingURL=ArrayUtils.js.map