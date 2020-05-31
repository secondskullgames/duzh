"use strict";
/*
 * This file defines additional functions that will be exported to the "global namespace" (window.jwb.*)
 * that are only nitended for debugging purposes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
function revealMap() {
    jwb.DEBUG = true;
    jwb.renderer.render();
}
exports.revealMap = revealMap;
function killEnemies() {
    var map = jwb.state.getMap();
    map.units = map.units.filter(function (u) { return u === jwb.state.playerUnit; });
    jwb.renderer.render();
}
exports.killEnemies = killEnemies;
//# sourceMappingURL=debug.js.map