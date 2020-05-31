"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function resolvedPromise(value) {
    return new Promise(function (resolve) { return resolve(value); });
}
exports.resolvedPromise = resolvedPromise;
function chainPromises(_a, input) {
    var first = _a[0], rest = _a.slice(1);
    if (!!first) {
        return first(input).then(function (output) { return chainPromises(rest, output); });
    }
    return resolvedPromise(input);
}
exports.chainPromises = chainPromises;
function wait(milliseconds) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, milliseconds);
    });
}
exports.wait = wait;
//# sourceMappingURL=PromiseUtils.js.map