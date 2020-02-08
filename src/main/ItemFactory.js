{
  /**
   * @param {int} lifeRestored
   * @return InventoryItem
   */
  function createPotion(lifeRestored) {
    const { ItemCategory } = jwb.types;
    const { InventoryItem } = jwb;
    const onUse = (item, unit) => {
      const prevLife = unit.life;
      unit.life = Math.min(unit.life + lifeRestored, unit.maxLife);
      jwb.state.messages.push(`${unit.name} used ${item.name} and gained ${(unit.life - prevLife)} life.`);
    };
    return new InventoryItem('Potion', ItemCategory.POTION, onUse);
  }

  function createSword(damage) {
    const { ItemCategory, EquipmentCategory, Stats } = jwb.types;
    return new InventoryItem('Short Sword', ItemCategory.WEAPON, (item, unit) => {
      const equippedSword = new EquippedItem('Short Sword', EquipmentCategory.WEAPON, item, damage);
      unit.equipment[EquipmentCategory.WEAPON].push(equippedSword);
    });
  }

  jwb.ItemFactory = {
    createPotion,
    createSword
  };
}
