"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MapUtils_1 = require("../../main/maps/MapUtils");
function testAreAdjacent() {
    // right-left
    // ####
    // ####****
    // ####****
    {
        var first = { left: 0, top: 0, width: 4, height: 3 };
        var second = { left: 4, top: 1, width: 4, height: 2 };
        _assert(MapUtils_1.areAdjacent(first, second, 2));
        _assert(!MapUtils_1.areAdjacent(first, second, 3));
    }
    // bottom-top
    //
    //   ####
    //   ####
    //    ***
    //    ***
    {
        var first = { left: 2, top: 2, width: 4, height: 2 };
        var second = { left: 3, top: 4, width: 3, height: 2 };
        _assert(MapUtils_1.areAdjacent(first, second, 3));
        _assert(!MapUtils_1.areAdjacent(first, second, 4));
    }
    // left-right
    {
        var first = { left: 6, top: 0, width: 6, height: 7 };
        var second = { left: 0, top: 0, width: 6, height: 7 };
        _assert(MapUtils_1.areAdjacent(first, second, 5));
    }
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