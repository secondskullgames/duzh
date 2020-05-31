"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InventoryItem = /** @class */ (function () {
    function InventoryItem(name, category, onUse) {
        var _this = this;
        this.name = name;
        this.category = category;
        this._onUse = function (unit) { return onUse(_this, unit); };
    }
    InventoryItem.prototype.use = function (unit) {
        return this._onUse(unit);
    };
    return InventoryItem;
}());
exports.default = InventoryItem;
//# sourceMappingURL=InventoryItem.js.map