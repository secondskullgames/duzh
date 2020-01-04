/**
 * @typedef TileType {{
 *  isBlocking: boolean
 * }}
 */

{
  window.jwb = window.jwb || {};
  /**
   * @type {Object<String, TileType>}
   */
  window.jwb.tileTypes = {
    FLOOR: { name: 'FLOOR', char: '.', isBlocking: false },
    WALL: { name: 'WALL', char: '#', isBlocking: true },
    NONE: { name: 'NONE', char: ' ', isBlocking: true }
  };
}