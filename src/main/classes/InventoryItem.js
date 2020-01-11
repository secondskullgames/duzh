/**
 * @param {name} category
 * @param {string} category
 * @param {Function<Unit, void>} onUse
 */
function InventoryItem(name, category, onUse) {
  function use(unit) {
    onUse(unit);
  }

  return {
    class: 'InventoryItem',
    name,
    category,
    use: onUse
  }
}
