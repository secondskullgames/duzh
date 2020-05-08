function revealMap() {
    jwb.DEBUG = true;
    jwb.renderer.render();
}
function killEnemies() {
    var map = jwb.state.getMap();
    map.units = map.units.filter(function (u) { return u === jwb.state.playerUnit; });
    jwb.renderer.render();
}
export { revealMap, killEnemies };
//# sourceMappingURL=debug.js.map