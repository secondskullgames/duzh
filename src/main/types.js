/**
 * @typedef Coordinates {{
 *   x: int,
 *   y: int
 * }}
 */

/**
 * @typedef Rect {{
 *   left: int,
 *   top: int,
 *   width: int,
 *   height: int
 * }}
 */

{
  window.jwb = window.jwb || {};
  jwb.types = {
    Tiles: {
      FLOOR: new Tile('FLOOR', '.', () => jwb.SpriteFactory.getFloorSprite(), false),
      FLOOR_HALL: new Tile('FLOOR_HALL', '.', () => jwb.SpriteFactory.getHallFloorSprite(), false),
      TOP_WALL: new Tile('WALL', '<span style="color: #aaa">#</span>', () => jwb.SpriteFactory.getTopWallSprite(), true),
      WALL: new Tile('WALL', ' ', () => null, true),
      NONE: new Tile('NONE', ' ', null, true),
      STAIRS_DOWN: new Tile('STAIRS_DOWN', '>', null, false)
    },

    ItemCategory: {
      POTION: 'POTION',
      WEAPON: 'WEAPON'
    },

    EquipmentCategory: {
      WEAPON: 'WEAPON',
      ARMOR: 'ARMOR'
    },

    Stats: {
      DAMAGE: 'DAMAGE',
      HP: 'HP'
    }
  };
}
