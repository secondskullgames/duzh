{
  /**
   * @param {int} hpRestored
   * @return InventoryItem
   */
  function createPotion(hpRestored) {
    const { ItemCategory } = jwb.types;
    return new InventoryItem('Potion', ItemCategory.POTION, (item, unit) => {
      const prevHP = unit.currentHP;
      unit.currentHP = Math.min(unit.currentHP + hpRestored, unit.maxHP);
      jwb.state.messages.push(`${unit.name} used ${item.name} and gained ${(unit.currentHP - prevHP)} HP.`);
    });
  }

  function createSword(damage) {
    const { ItemCategory, EquipmentCategory, Stats } = types;
    return new InventoryItem('Short Sword', ItemCategory.WEAPON, (item, unit) => {
      const equippedSword = new EquippedItem('Short Sword', EquipmentCategory.WEAPON, item, { [Stats.DAMAGE]: 10 });
      unit.equipment[EquipmentCategory.WEAPON] = equippedSword;
    });
  }

  jwb.ItemFactory = {
    createPotion,
    createSword
  };
}
