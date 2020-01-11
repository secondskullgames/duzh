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
  window.jwb.types = window.jwb.types || [];

  window.jwb.types.Tiles = {
    FLOOR: new Tile('FLOOR', '.', false),
    WALL: new Tile('WALL', '<span style="color: #aaa">#</span>', true),
    NONE: new Tile('NONE', ' ', true),
    STAIRS_DOWN: new Tile('STAIRS_DOWN', '>', false)
  };

  window.jwb.types.ItemCategory = {
    POTION: 'POTION',
    WEAPON: 'WEAPON'
  };

  window.jwb.types.EquipmentCategory = {
    WEAPON: 'WEAPON',
    ARMOR: 'ARMOR'
  };

  window.jwb.types.Stats = {
    DAMAGE: 'DAMAGE',
    HP: 'HP'
  };
}
