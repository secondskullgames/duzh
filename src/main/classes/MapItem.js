/**
 * @param {!int} x
 * @param {!int} y
 * @param {!string} char
 * @param {!Sprite} sprite
 * @param {!function(): !InventoryItem} itemSupplier
 *
 * @constructor
 */
function MapItem(x, y, char, sprite, itemSupplier) {
  /**
   * @type {!string}
   */
  this.class = 'MapItem';
  /**
   * @type {!int}
   */
  this.x = x;
  /**
   * @type {!int}
   */
  this.y = y;
  /**
   * @type {!string}
   */
  this.char = char;
  /**
   * @type {!function(): !InventoryItem}
   */
  this.getInventoryItem = itemSupplier;
  /**
   * @returns {!Sprite}
   */
  this.getSprite = () => sprite;
}
