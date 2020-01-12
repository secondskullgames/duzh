{
  function getPlayerSprite() {
    return new Sprite('player_attacking_E_1', { dx: 0, dy: -24 });
  }

  const SpriteFactory = {
    getPlayerSprite
  };
  window.jwb = window.jwb || {};
  jwb.SpriteFactory = SpriteFactory;
}