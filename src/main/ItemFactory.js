{
  /**
   * @param {!int} lifeRestored
   * @return !InventoryItem
   */
  function createPotion(lifeRestored) {
    const { ItemCategory } = jwb.types;
    const { InventoryItem, audio, Sounds } = jwb;
    const onUse = (item, unit) => {
      audio.playSound(Sounds.USE_POTION);
      const prevLife = unit.life;
      unit.life = Math.min(unit.life + lifeRestored, unit.maxLife);
      jwb.state.messages.push(`${unit.name} used ${item.name} and gained ${(unit.life - prevLife)} life.`);
    };
    return new InventoryItem('Potion', ItemCategory.POTION, onUse);
  }

  /**
   * @param {!int} damage
   * @return !InventoryItem
   */
  function createSword(damage) {
    const { ItemCategory, EquipmentCategory } = jwb.types;
    return new InventoryItem('Short Sword', ItemCategory.WEAPON, (item, unit) => {
      const equippedSword = new EquippedItem('Short Sword', EquipmentCategory.WEAPON, item, damage);
      const currentWeapons = [...unit.equipment[EquipmentCategory.WEAPON]];
      unit.equipment[EquipmentCategory.WEAPON] = [equippedSword];
      currentWeapons.forEach(weapon => {
        const { inventoryItem } = weapon;
        unit.inventory[inventoryItem.category].push(inventoryItem);
      })
    });
  }

  function createScrollOfFloorFire(damage) {
    const { ItemCategory } = jwb.types;
    const { InventoryItem } = jwb;
    const { map } = jwb.state;
    const { isAdjacent } = jwb.utils.MapUtils;

    const onUse = (item, unit) => {
      const adjacentUnits = map.units.filter(u => isAdjacent(u, unit));
      adjacentUnits.forEach(u => u.takeDamage(damage, unit));
    };
    return new InventoryItem('Scroll of Floor Fire', ItemCategory.SCROLL, onUse);
  }

  jwb.ItemFactory = {
    createPotion,
    createSword,
    createScrollOfFloorFire
  };
}
