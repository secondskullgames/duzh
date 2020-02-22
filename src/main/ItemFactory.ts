import Sounds from './Sounds';
import InventoryItem from './classes/InventoryItem';
import { EquipmentCategory, ItemCategory } from './types';
import { playSound } from './utils/AudioUtils';
import EquippedItem from './classes/EquippedItem';
import Unit from './classes/Unit';
import { chainPromises } from './utils/PromiseUtils';
import MapItem from './classes/MapItem';
import { randInt } from './utils/RandomUtils';
import SpriteFactory from './SpriteFactory';

type ItemProc = (item: InventoryItem, unit: Unit) => Promise<void>;

function createPotion(lifeRestored): InventoryItem {
  const onUse: ItemProc = (item: InventoryItem, unit: Unit): Promise<void> => {
    return new Promise(resolve => {
      playSound(Sounds.USE_POTION);
      const prevLife = unit.life;
      unit.life = Math.min(unit.life + lifeRestored, unit.maxLife);
      jwb.state.messages.push(`${unit.name} used ${item.name} and gained ${(unit.life - prevLife)} life.`);
      resolve();
    });
  };
  return new InventoryItem('Potion', ItemCategory.POTION, onUse);
}

function createSword(damage): InventoryItem {
  const onUse: ItemProc = (item, unit): Promise<void> => {
    return new Promise(resolve => {
      const equippedSword: EquippedItem = {
        name: 'Short Sword',
        category: EquipmentCategory.WEAPON,
        inventoryItem: item,
        damage
      };
      const currentWeapons = [...unit.equipment[EquipmentCategory.WEAPON]];
      unit.equipment[EquipmentCategory.WEAPON] = [equippedSword];
      currentWeapons.forEach(weapon => {
        const { inventoryItem } = weapon;
        unit.inventory[inventoryItem.category].push(inventoryItem);
      });
      resolve();
    });
  };
  return new InventoryItem('Short Sword', ItemCategory.WEAPON, onUse);
}

function createScrollOfFloorFire(damage): InventoryItem {
  const { map } = jwb.state;

  const onUse: ItemProc = (item, unit): Promise<void> => {
    const promises: (() => Promise<any>)[] = [];

    const adjacentUnits = map.units.filter(u => {
      const dx = unit.x - u.x;
      const dy = unit.y - u.y;
      return ([-1,0,1].indexOf(dx) > -1)
        && ([-1,0,1].indexOf(dy) > -1)
        && !(dx === 0 && dy === 0);
    });
    console.log(`casting floor fire on ${adjacentUnits}`);
    adjacentUnits.forEach(u => {
      promises.push(() => u.takeDamage(damage, unit));
    });
    return chainPromises(promises);
  };
  return new InventoryItem('Scroll of Floor Fire', ItemCategory.SCROLL, onUse);
}

function createRandomItem({ x, y }): MapItem {
  switch (randInt(0, 4)) {
    case 0:
      return {
        x,
        y,
        char: 'S',
        sprite: SpriteFactory.MAP_SWORD(),
        inventoryItem: () => createSword(6)
      };
    case 1:
      return {
        x,
        y,
        char: 'K',
        sprite: SpriteFactory.MAP_SCROLL(),
        inventoryItem: () => createScrollOfFloorFire(200)
      };
    default:
      return {
        x,
        y,
        char: 'P',
        sprite: SpriteFactory.MAP_POTION(),
        inventoryItem: () => createPotion(50)
      };
  }
}

export default {
  createPotion,
  createSword,
  createScrollOfFloorFire,
  createRandomItem
};