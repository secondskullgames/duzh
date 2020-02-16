/**
 * @param {!int} lifeRestored
 * @return !InventoryItem
 */
import Sounds from './Sounds';
import InventoryItem from './classes/InventoryItem';
import { EquipmentCategory, ItemCategory } from './types';
import { playSound } from './audio';
import EquippedItem from './classes/EquippedItem';
import { isAdjacent } from './utils/MapUtils';

function createPotion(lifeRestored) {
  const onUse = (item, unit) => {
    playSound(Sounds.USE_POTION);
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
  const { map } = jwb.state;

  const onUse = (item, unit) => {
    const adjacentUnits = map.units.filter(u => isAdjacent(u, unit));
    adjacentUnits.forEach(u => u.takeDamage(damage, unit));
  };
  return new InventoryItem('Scroll of Floor Fire', ItemCategory.SCROLL, onUse);
}

export default {
  createPotion,
  createSword,
  createScrollOfFloorFire
};