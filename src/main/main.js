{
  window.onload = () => {
    const { MapFactory, SpriteFactory, SpriteRenderer, UnitFactory } = jwb;

    jwb.state = new GameState(UnitFactory.PLAYER({ x: 0, y: 0 }), [
      MapFactory.randomMap(22, 14, 4, 5),
      MapFactory.randomMap(22, 14, 5, 5),
      MapFactory.randomMap(22, 14, 5, 4),
      MapFactory.randomMap(22, 14, 6, 3),
      MapFactory.randomMap(22, 14, 6, 2),
      MapFactory.randomMap(22, 14, 7, 1),
    ]);

    //jwb.renderer = new AsciiRenderer();
    jwb.renderer = new SpriteRenderer();

    jwb.actions.loadMap(0);
    jwb.input.attachEvents();
    jwb.renderer.render();
  }
}
