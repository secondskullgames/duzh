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