"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MapUtils_1 = require("../../main/maps/MapUtils");
function testAreAdjacent() {
    // ####
    // ####****
    // ####****
    var first = { left: 0, top: 0, width: 4, height: 3 };
    var second = { left: 4, top: 1, width: 4, height: 2 };
    _assert(MapUtils_1.areAdjacent(first, second, 2));
    _assert(!MapUtils_1.areAdjacent(first, second, 3));
}
function _assert(condition, message) {
    if (message === void 0) { message = 'fux'; }
    if (!condition) {
        throw new Error(message);
    }
}
function default_1() {
    testAreAdjacent();
}
exports.default = default_1;
//# sourceMappingURL=TestMapUtils.js.map