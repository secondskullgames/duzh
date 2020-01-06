{
  const { mapFactory } = window.jwb;

  window.jwb.state = new GameState(new Unit(4, 10, 'player', 100), [
    mapFactory.randomMap(40, 20, 5),
    mapFactory.FIXED_MAPS[0],
    mapFactory.FIXED_MAPS[1]
  ]);
  window.jwb.state.loadMap(0);

  window.onload = () => {
    window.jwb.input.attachEvents();
    window.jwb.renderer.render();
  }
}