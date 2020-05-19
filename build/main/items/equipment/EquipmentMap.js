"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represent's a unit's equipment, mapped by slot.
 */
var EquipmentMap = /** @class */ (function () {
    function EquipmentMap() {
        this._map = {};
    }
    EquipmentMap.prototype.add = function (item) {
        this._map[item.slot] = item;
    };
    EquipmentMap.prototype.remove = function (item) {
        this._map[item.slot] = undefined;
    };
    EquipmentMap.prototype.get = function (category) {
        return this._map[category] || null;
    };
    EquipmentMap.prototype.getEntries = function () {
        return __spreadArrays(Object.entries(this._map));
    };
    return EquipmentMap;
}());
exports.default = EquipmentMap;
//# sourceMappingURL=EquipmentMap.js.map