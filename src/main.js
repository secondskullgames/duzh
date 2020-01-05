{
  const { MapFactory, Renderer } = window.jwb;

  window.jwb.state = new GameState(new Unit(4, 10, 'player', 100), [MapFactory.FIXED_MAPS[0], MapFactory.FIXED_MAPS[1]]);
  window.jwb.state.loadMap(0);

  window.onload = () => Renderer.render();
}