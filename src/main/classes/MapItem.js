/**
 * @param {int} x
 * @param {int} y
 * @param {string} char
 * @param {Function<void, InventoryItem>} itemSupplier
 *
 * @constructor
 */
function MapItem(x, y, char, itemSupplier) {
  /**
   * @return {InventoryItem}
   */
  function getInventoryItem() {
    return itemSupplier();
  }

  this.class = 'MapItem';
  this.x = x;
  this.y = y;
  this.char = char;
  this.getInventoryItem = getInventoryItem;
}
