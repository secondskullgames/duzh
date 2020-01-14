{
  function getPlayerSprite() {
    return new Sprite('player_standing_SE_1', { dx: -4, dy: -20 }, '#ffffff');
  }

  function getTopWallSprite() {
    return new Sprite('tile_wall_top', { dx: 0, dy: 0 }, '#ffffff');
  }

  function getFloorSprite() {
    return new Sprite('tile_floor', { dx: 0, dy: 0 }, '#ffffff');
  }

  function getHallFloorSprite() {
    return new Sprite('tile_floor_hall', { dx: 0, dy: 0 }, '#ffffff');
  }

  function getSwordMapSprite() {
    return new Sprite('sword_icon_small', { dx: 0, dy: 0 }, '#ffffff');
  }

  function getPotionMapSprite() {
    return new Sprite('potion_small', { dx: 0, dy: -8 }, '#ffffff');
  }

  const SpriteFactory = {
    getPlayerSprite,
    getTopWallSprite,
    getFloorSprite,
    getHallFloorSprite,
    getSwordMapSprite,
    getPotionMapSprite
  };

  window.jwb = window.jwb || {};
  jwb.SpriteFactory = SpriteFactory;
}