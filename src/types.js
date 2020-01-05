/**
 * @typedef TileType {{
 *  isBlocking: boolean
 * }}
 */

/**
 * @typedef Coordinates {{
 *   x: int,
 *   y: int
 * }}
 */

{
  window.jwb = window.jwb || {};
  window.jwb.types = {
    TileType: {
      FLOOR: { name: 'FLOOR', char: '.', isBlocking: false },
      WALL: { name: 'WALL', char: '#', isBlocking: true },
      NONE: { name: 'NONE', char: ' ', isBlocking: true },
      STAIRS_UP: { name: 'STAIRS_DOWN', char: '>', isBlocking: false }
    }
  };
}