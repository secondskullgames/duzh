{
  const { MapFactory } = jwb;

  jwb.state = new GameState(new Unit(4, 10, 'player', 10, 100), [
    MapFactory.randomMap(40, 24, 5, 10),
    MapFactory.randomMap(40, 24, 7, 9),
    MapFactory.randomMap(40, 24, 9, 8),
    MapFactory.randomMap(40, 24, 11, 7),
    MapFactory.randomMap(40, 24, 13, 6),
    MapFactory.randomMap(40, 24, 15, 5)
  ]);

  jwb.renderer = new AsciiRenderer();

  jwb.actions.loadMap(0);

  window.onload = () => {
    jwb.input.attachEvents();
    jwb.renderer.render();
  }
}
