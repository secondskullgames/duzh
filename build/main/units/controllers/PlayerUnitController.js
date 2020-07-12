"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PromiseUtils_1 = require("../../utils/PromiseUtils");
var PlayerUnitController = /** @class */ (function () {
    function PlayerUnitController() {
        this.queuedOrder = null;
    }
    PlayerUnitController.prototype.issueOrder = function (unit) {
        if (!!this.queuedOrder) {
            var queuedOrder = this.queuedOrder;
            this.queuedOrder = null;
            return queuedOrder();
        }
        return PromiseUtils_1.resolvedPromise();
    };
    return PlayerUnitController;
}());
exports.default = PlayerUnitController;
//# sourceMappingURL=PlayerUnitController.js.map