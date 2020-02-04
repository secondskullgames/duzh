/**
 * @typedef Coordinates
 * @property {!int} x
 * @property {!int} y
 */

/**
 * @typedef {Object} Rect
 * @property {!int} left
 * @property {!int} top
 * @property {!int} width
 * @property {!int} height
 */

/**
 * @typedef {Object} Room
 * @property {!number} left
 * @property {!number} top
 * @property {!number} width
 * @property {!number} height
 * @property {!Coordinates[]} exits
 */

/**
 * @typedef {Object} MapSection
 * @property {!int} width
 * @property {!int} height
 * @property {!Room[]} rooms
 * @property {!Tile[][]} tiles
 */

{
  window.jwb = window.jwb || {};
  jwb.types = {
    Tiles: {
      FLOOR: new Tile('FLOOR', '.', () => jwb.SpriteFactory.FLOOR(), false),
      FLOOR_HALL: new Tile('FLOOR_HALL', '.', () => jwb.SpriteFactory.FLOOR_HALL(), false),
      WALL_TOP: new Tile('WALL', '#', () => jwb.SpriteFactory.WALL_TOP(), true),
      WALL_HALL: new Tile('WALL', '#', () => jwb.SpriteFactory.WALL_HALL(), true),
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
