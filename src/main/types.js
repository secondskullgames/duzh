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

/**
 * @typedef {Object} MapSection
 * @property {int} width
 * @property {int} height
 * @property {Room[]} rooms
 * @property {Tile[][]} tiles
 */

{
  window.jwb = window.jwb || {};
  jwb.types = {
    Tiles: {
      FLOOR: new Tile('FLOOR', '.', () => jwb.SpriteFactory.FLOOR(), false),
      FLOOR_HALL: new Tile('FLOOR_HALL', '.', () => jwb.SpriteFactory.FLOOR_HALL(), false),
      TOP_WALL: new Tile('WALL', '<span style="color: #aaa">#</span>', () => jwb.SpriteFactory.WALL_TOP(), true),
      WALL: new Tile('WALL', ' ', () => null, true),
      NONE: new Tile('NONE', ' ', null, true),
      STAIRS_DOWN: new Tile('STAIRS_DOWN', '>', () => jwb.SpriteFactory.STAIRS_DOWN(), false)
    },

    ItemCategory: {
      POTION: 'POTION',
      WEAPON: 'WEAPON'
    },

    EquipmentCategory: {
      WEAPON: 'WEAPON',
      ARMOR: 'ARMOR'
    },

    Stat: {
      DAMAGE: 'DAMAGE',
      HP: 'HP'
    }
  };
}
