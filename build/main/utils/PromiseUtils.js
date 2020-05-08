function resolvedPromise(value) {
    return new Promise(function (resolve) { return resolve(value); });
}
function chainPromises(_a, input) {
    var first = _a[0], rest = _a.slice(1);
    if (!!first) {
        return first(input).then(function (output) { return chainPromises(rest, output); });
    }
    return resolvedPromise(input);
}
function wait(milliseconds) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, milliseconds);
    });
}
export { chainPromises, resolvedPromise, wait };
//# sourceMappingURL=PromiseUtils.js.map