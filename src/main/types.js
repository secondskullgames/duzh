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
  jwb = jwb || {};
  jwb.types = jwb.types || [];

  jwb.types.Tiles = {
    FLOOR: new Tile('FLOOR', '.', false),
    WALL: new Tile('WALL', '<span style="color: #aaa">#</span>', true),
    NONE: new Tile('NONE', ' ', true),
    STAIRS_DOWN: new Tile('STAIRS_DOWN', '>', false)
  };

  jwb.types.ItemCategory = {
    POTION: 'POTION',
    WEAPON: 'WEAPON'
  };

  jwb.types.EquipmentCategory = {
    WEAPON: 'WEAPON',
    ARMOR: 'ARMOR'
  };

  jwb.types.Stats = {
    DAMAGE: 'DAMAGE',
    HP: 'HP'
  };
}
