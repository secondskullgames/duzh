{
  function getPlayerSprite() {
    return new Sprite('player_standing_SE_1', { dx: -4, dy: -16 });
  }

  const SpriteFactory = {
    getPlayerSprite
  };
  window.jwb = window.jwb || {};
  jwb.SpriteFactory = SpriteFactory;
}