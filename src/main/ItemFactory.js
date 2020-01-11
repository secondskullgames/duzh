{
  /**
   * @param {int} hpRestored
   * @return InventoryItem
   */
  function createPotion(hpRestored) {
    const { ItemCategory } = window.jwb.types;
    return new InventoryItem('Potion', ItemCategory.POTION, unit => {
      unit.currentHP = Math.min(unit.currentHP + hpRestored, unit.maxHP);
    });
  }

  function createSword(damage) {
    const { ItemCategory } = window.jwb.types;
    return new InventoryItem('Sword of Suck', ItemCategory.WEAPON, unit => {
      console.log('hello i am equipping a sword');
    });
  }

  window.jwb.ItemFactory = {
    createPotion,
    createSword
  };
}
