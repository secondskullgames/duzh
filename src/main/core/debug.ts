/*
 * This file defines additional functions that will be exported to the "global namespace" (window.jwb.*)
 * that are only nitended for debugging purposes.
 */

function revealMap() {
  jwb.DEBUG = true;
  jwb.renderer.render();
}

function killEnemies() {
  const map = jwb.state.getMap();
  map.units = map.units.filter(u => u === jwb.state.playerUnit);
  jwb.renderer.render();
}

export {
  revealMap,
  killEnemies
};