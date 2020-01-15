{
  window.onload = () => {
    const { MapFactory, SpriteFactory, SpriteRenderer, UnitFactory } = jwb;

    jwb.state = new GameState(UnitFactory.PLAYER({ x: 0, y: 0 }), [
      MapFactory.randomMap(22, 14, 5, 6),
      MapFactory.randomMap(22, 14, 6, 5),
      MapFactory.randomMap(22, 14, 7, 4),
      MapFactory.randomMap(22, 14, 8, 3),
      MapFactory.randomMap(22, 14, 9, 2),
      MapFactory.randomMap(22, 14, 10, 1),
    ]);

    //jwb.renderer = new AsciiRenderer();
    jwb.renderer = new SpriteRenderer();

    jwb.actions.loadMap(0);
    jwb.input.attachEvents();
    jwb.renderer.render();
  }
}
