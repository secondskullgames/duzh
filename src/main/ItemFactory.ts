import Sounds from './Sounds';
import InventoryItem from './classes/InventoryItem';
import { EquipmentCategory, ItemCategory, Coordinates } from './types';
import { playSound } from './utils/AudioUtils';
import EquippedItem from './classes/EquippedItem';
import Unit from './classes/Unit';
import { chainPromises } from './utils/PromiseUtils';
import { randChoice } from './utils/RandomUtils';
import SpriteFactory from './SpriteFactory';
import EquipmentClasses, { EquipmentClass } from './EquipmentClasses';
import MapItem from './classes/MapItem';

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

function _equipEquipment(equipmentClass: EquipmentClass, item: InventoryItem, unit: Unit): Promise<void> {
  return new Promise(resolve => {
    const equippedItem: EquippedItem = {
      name: equipmentClass.name,
      category: equipmentClass.equipmentCategory,
      inventoryItem: item,
      damage: equipmentClass.damage
    };
    const currentWeapons = [...unit.equipment[EquipmentCategory.WEAPON]];
    unit.equipment[EquipmentCategory.WEAPON] = [equippedItem];
    currentWeapons.forEach(weapon => {
      const { inventoryItem } = weapon;
      unit.inventory[inventoryItem.category].push(inventoryItem);
    });
    resolve();
  });
}

function createScrollOfFloorFire(damage): InventoryItem {
  const onUse: ItemProc = (item, unit): Promise<void> => {
    const { map } = jwb.state;
    const promises: (() => Promise<any>)[] = [];

    const adjacentUnits: Unit[] = map.units.filter(u => {
      const dx = unit.x - u.x;
      const dy = unit.y - u.y;
      return ([-1,0,1].indexOf(dx) > -1)
        && ([-1,0,1].indexOf(dy) > -1)
        && !(dx === 0 && dy === 0);
    });

    console.log(`casting floor fire on ${JSON.stringify(adjacentUnits)}`);
    adjacentUnits.forEach(u => {
      promises.push(() => u.takeDamage(damage, unit));
    });
    return chainPromises(promises);
  };
  return new InventoryItem('Scroll of Floor Fire', ItemCategory.SCROLL, onUse);
}

function _createInventoryWeapon(weaponClass: EquipmentClass): InventoryItem {
  const onUse: ItemProc = (item: InventoryItem, unit: Unit) => _equipEquipment(weaponClass, item, unit);
  return new InventoryItem(weaponClass.name, weaponClass.itemCategory, onUse);
}

function _createMapEquipment(equipmentClass: EquipmentClass, { x, y }: Coordinates): MapItem {
  const sprite = equipmentClass.mapIcon(equipmentClass.paletteSwaps);
  const inventoryItem: InventoryItem = _createInventoryWeapon(equipmentClass);
  return new MapItem({ x, y }, equipmentClass.char, sprite, inventoryItem);
}

type MapItemSupplier = ({ x, y }: Coordinates) => MapItem;

function _getItemSuppliers(level: number): MapItemSupplier[] {
  const createMapPotion: MapItemSupplier = ({ x, y }: Coordinates) => {
    const sprite = SpriteFactory.MAP_POTION();
    const inventoryItem = createPotion(50);
    return new MapItem({ x, y }, 'K', sprite, inventoryItem);
  };

  const createFloorFireScroll = ({ x, y }: Coordinates) => {
    const sprite = SpriteFactory.MAP_SCROLL();
    const inventoryItem = createScrollOfFloorFire(200);
    return new MapItem({ x, y }, 'K', sprite, inventoryItem);
  };

  return [createMapPotion, createFloorFireScroll];
}

function _getWeaponSuppliers(level: number): MapItemSupplier[] {
  return EquipmentClasses.getWeaponClasses()
    .filter(weaponClass => level >= weaponClass.minLevel)
    .filter(weaponClass => level <= weaponClass.maxLevel)
    .map(weaponClass => ({ x, y }) => _createMapEquipment(weaponClass, { x, y }));
}

function createRandomItem({ x, y }: Coordinates, level: number): MapItem {
  const suppliers: MapItemSupplier[] = [..._getItemSuppliers(level), ..._getWeaponSuppliers(level)];
  return randChoice(suppliers)({ x, y });
}

export default {
  createRandomItem
};