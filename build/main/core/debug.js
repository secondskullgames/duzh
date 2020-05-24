"use strict";
/*
 * This file defines additional functions that will be exported to the "global namespace" (window.jwb.*)
 * that are only nitended for debugging purposes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("../types/types");
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
function renderMinimap() {
    jwb.state.screen = types_1.GameScreen.MINIMAP;
}
exports.renderMinimap = renderMinimap;
//# sourceMappingURL=debug.js.map