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
    WALL: new Tile('WALL', '#', true),
    NONE: new Tile('NONE', ' ', true),
    STAIRS_UP: new Tile('STAIRS_DOWN', '>', false)
  };
}