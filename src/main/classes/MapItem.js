/**
 * @param {int} x
 * @param {int} y
 * @param {Function<void, InventoryItem>} itemSupplier
 */
function MapItem(x, y, itemSupplier) {
  /**
   * @return {InventoryItem}
   */
  function getInventoryItem() {
    return itemSupplier();
  }

  return {
    class: 'MapItem',
    x,
    y,
    getInventoryItem
  };
}
