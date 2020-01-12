/**
 * @param {int} x
 * @param {int} y
 * @param {string} char
 * @param {Sprite} sprite
 * @param {Function<void, InventoryItem>} itemSupplier
 *
 * @constructor
 */
function MapItem(x, y, char, sprite, itemSupplier) {
  /**
   * @return {InventoryItem}
   */
  function getInventoryItem() {
    return itemSupplier.call(null);
  }

  this.class = 'MapItem';
  this.x = x;
  this.y = y;
  this.char = char;
  this.getInventoryItem = getInventoryItem;
  this.getSprite = () => sprite;
}
