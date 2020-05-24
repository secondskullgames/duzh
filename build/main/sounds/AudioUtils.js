"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function transpose8va(_a) {
    var freq = _a[0], ms = _a[1];
    return [freq * 2, ms];
}
exports.transpose8va = transpose8va;
function transpose8vb(_a) {
    var freq = _a[0], ms = _a[1];
    return [freq / 2, ms];
}
exports.transpose8vb = transpose8vb;
//# sourceMappingURL=AudioUtils.js.map