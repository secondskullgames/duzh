"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PromiseUtils_1 = require("../utils/PromiseUtils");
function playTurn(playerUnitOrder) {
    var playerUnit = jwb.state.playerUnit;
    playerUnit.queuedOrder = !!playerUnitOrder ? (function () { return playerUnitOrder(playerUnit); }) : null;
    return _update();
}
function _update() {
    var state = jwb.state;
    var playerUnit = state.playerUnit;
    var map = state.getMap();
    // make sure the player unit's update happens first
    var unitPromises = [];
    unitPromises.push(function () { return playerUnit.update(); });
    map.units.forEach(function (u) {
        if (u !== playerUnit) {
            unitPromises.push(function () { return u.update(); });
        }
    });
    return PromiseUtils_1.chainPromises(unitPromises)
        .then(function () { return jwb.renderer.render(); })
        .then(function () {
        state.turn++;
        state.messages = [];
    });
}
exports.default = {
    playTurn: playTurn
};
//# sourceMappingURL=TurnHandler.js.map