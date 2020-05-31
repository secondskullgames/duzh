"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("../types/types");
var categories = Object.values(types_1.ItemCategory);
/**
 * Contains information about all items held by a particular unit, grouped by category,
 * as well as data about the selected item/category in the inventory menu
 * (although this is only applicable to the player unit)
 */
var InventoryMap = /** @class */ (function () {
    function InventoryMap() {
        // @ts-ignore
        this._map = {};
        for (var _i = 0, categories_1 = categories; _i < categories_1.length; _i++) {
            var category = categories_1[_i];
            this._map[category] = [];
        }
        this.selectedCategory = categories[0];
        this.selectedItem = null;
    }
    InventoryMap.prototype.add = function (item) {
        this._map[item.category].push(item);
        if (this.selectedCategory === item.category && this.selectedItem === null) {
            this.selectedItem = item;
        }
    };
    InventoryMap.prototype.remove = function (item) {
        var items = this._map[item.category];
        var index = items.indexOf(item);
        items.splice(index, 1);
        if (this.selectedItem === item) {
            this.selectedItem = items[index % items.length] || null;
        }
    };
    InventoryMap.prototype.nextCategory = function () {
        var index = categories.indexOf(this.selectedCategory);
        this.selectedCategory = categories[(index + 1) % categories.length];
        this.selectedItem = this._map[this.selectedCategory][0] || null;
    };
    InventoryMap.prototype.previousCategory = function () {
        var index = categories.indexOf(this.selectedCategory);
        this.selectedCategory = categories[(index - 1 + categories.length) % categories.length];
        this.selectedItem = this._map[this.selectedCategory][0] || null;
    };
    InventoryMap.prototype.get = function (category) {
        return __spreadArrays(this._map[category]);
    };
    InventoryMap.prototype.nextItem = function () {
        var items = this._map[this.selectedCategory];
        if (items.length > 0 && this.selectedItem !== null) {
            var index = items.indexOf(this.selectedItem);
            this.selectedItem = items[(index + 1) % items.length];
        }
    };
    InventoryMap.prototype.previousItem = function () {
        var items = this._map[this.selectedCategory];
        if (items.length > 0 && this.selectedItem !== null) {
            var index = items.indexOf(this.selectedItem);
            this.selectedItem = items[(index - 1 + items.length) % items.length];
        }
    };
    return InventoryMap;
}());
exports.default = InventoryMap;
//# sourceMappingURL=InventoryMap.js.map