{
  window.onload = () => {
    const { MapFactory, SpriteFactory, SpriteRenderer } = jwb;

    jwb.state = new GameState(new Unit(SpriteFactory.getPlayerSprite(), 4, 10, 'player', 10, 100), [
      MapFactory.randomMap(20, 12, 5, 10),
      MapFactory.randomMap(20, 12, 6, 9),
      MapFactory.randomMap(20, 12, 7, 8),
      MapFactory.randomMap(20, 12, 8, 7),
      MapFactory.randomMap(20, 12, 9, 6),
      MapFactory.randomMap(20, 12, 10, 5),
    ]);

    //jwb.renderer = new AsciiRenderer();
    jwb.renderer = new SpriteRenderer();

    jwb.actions.loadMap(0);
    jwb.input.attachEvents();
    jwb.renderer.render();
  }
}
