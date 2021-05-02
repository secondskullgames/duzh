import Sounds from '../sounds/Sounds';
import InventoryItem from './InventoryItem';
import Unit from '../units/Unit';
import MapItem from './MapItem';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import { chainPromises } from '../utils/PromiseUtils';
import { randChoice, randInt } from '../utils/RandomUtils';
import { EquipmentClass, EquipmentClasses } from './equipment/EquipmentClasses';
import { ItemCategory, Coordinates } from '../types/types';
import { playSound } from '../sounds/SoundFX';
import { playFloorFireAnimation } from '../graphics/animations/Animations';
import { equipItem } from './ItemUtils';

type ItemProc = (item: InventoryItem, unit: Unit) => Promise<void>;

function createPotion(lifeRestored: number): InventoryItem {
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

function createScrollOfFloorFire(damage: number): InventoryItem {
  const onUse: ItemProc = (item, unit): Promise<void> => {
    const map = jwb.state.getMap();
    const promises: (() => Promise<any>)[] = [];

    const adjacentUnits: Unit[] = map.units.filter(u => {
      const dx = unit.x - u.x;
      const dy = unit.y - u.y;
      return ([-1,0,1].indexOf(dx) > -1)
        && ([-1,0,1].indexOf(dy) > -1)
        && !(dx === 0 && dy === 0);
    });

    promises.push(() => playFloorFireAnimation(unit, adjacentUnits));

    adjacentUnits.forEach(u => {
      promises.push(() => u.takeDamage(damage, unit));
    });
    return chainPromises(promises);
  };
  return new InventoryItem('Scroll of Floor Fire', ItemCategory.SCROLL, onUse);
}

function _createMapEquipment(equipmentClass: EquipmentClass, { x, y }: Coordinates): MapItem {
  const sprite = equipmentClass.mapIcon(equipmentClass.paletteSwaps);
  const inventoryItem: InventoryItem = _createInventoryWeapon(equipmentClass);
  return new MapItem({ x, y }, equipmentClass.char, sprite, inventoryItem);
}

function _createInventoryWeapon(equipmentClass: EquipmentClass): InventoryItem {
  const onUse: ItemProc = (item: InventoryItem, unit: Unit) => {
    return equipItem(item, equipmentClass, unit);
  };
  return new InventoryItem(equipmentClass.name, equipmentClass.itemCategory, onUse);
}

type MapItemSupplier = ({ x, y }: Coordinates) => MapItem;

function _getItemSuppliers(level: number): MapItemSupplier[] {
  const createMapPotion: MapItemSupplier = ({ x, y }: Coordinates) => {
    const sprite = SpriteFactory.MAP_POTION();
    const inventoryItem = createPotion(40);
    return new MapItem({ x, y }, 'K', sprite, inventoryItem);
  };

  const createFloorFireScroll = ({ x, y }: Coordinates) => {
    const sprite = SpriteFactory.MAP_SCROLL();
    const inventoryItem = createScrollOfFloorFire(80);
    return new MapItem({ x, y }, 'K', sprite, inventoryItem);
  };

  return [createMapPotion, createFloorFireScroll];
}

function _getEquipmentSuppliers(level: number): MapItemSupplier[] {
  return Object.values(EquipmentClasses)
    .filter(equipmentClass => level >= equipmentClass.minLevel)
    .filter(equipmentClass => level <= equipmentClass.maxLevel)
    .map(equipmentClass => ({ x, y }) => _createMapEquipment(equipmentClass, { x, y }));
}

function createRandomItem({ x, y }: Coordinates, level: number): MapItem {
  let supplier: MapItemSupplier;
  if (randInt(0, 2) == 0) {
    supplier = randChoice(_getItemSuppliers(level))!!;
  } else {
    supplier = randChoice(_getEquipmentSuppliers(level))!!;
  }
  return supplier({ x, y });
}

export default {
  createRandomItem
};