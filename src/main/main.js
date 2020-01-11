{
  const { MapFactory } = window.jwb;

  jwb.state = new GameState(new Unit(4, 10, 'player', 10, 100), [
    MapFactory.randomMap(40, 24, 5, 15),
    MapFactory.FIXED_MAPS[0],
    MapFactory.FIXED_MAPS[1]
  ]);
  jwb.actions.loadMap(0);

  window.onload = () => {
    jwb.input.attachEvents();
    jwb.renderer.render();
  }
}
