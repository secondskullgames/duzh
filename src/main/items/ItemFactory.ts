import Sounds from '../sounds/Sounds';
import Equipment from './equipment/Equipment';
import InventoryItem from './InventoryItem';
import Unit from '../units/Unit';
import MapItem from './MapItem';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import { randChoice, randInt } from '../utils/random';
import EquipmentClass from './equipment/EquipmentClass';
import { ItemCategory, Coordinates } from '../types/types';
import { playSound } from '../sounds/SoundFX';
import { playFloorFireAnimation } from '../graphics/animations/Animations';
import { equipItem } from './ItemUtils';

type ItemProc = (item: InventoryItem, unit: Unit) => Promise<void>;

const createPotion = (lifeRestored: number): InventoryItem => {
  const onUse: ItemProc = async (item: InventoryItem, unit: Unit) => {
    playSound(Sounds.USE_POTION);
    const prevLife = unit.life;
    unit.life = Math.min(unit.life + lifeRestored, unit.maxLife);
    jwb.state.messages.push(`${unit.name} used ${item.name} and gained ${(unit.life - prevLife)} life.`);
  };

  return new InventoryItem('Potion', ItemCategory.POTION, onUse);
};

const createScrollOfFloorFire = async (damage: number): Promise<InventoryItem> => {
  const onUse: ItemProc = async (item, unit): Promise<void> => {
    const map = jwb.state.getMap();

    const adjacentUnits: Unit[] = map.units.filter(u => {
      const dx = unit.x - u.x;
      const dy = unit.y - u.y;
      return ([-1,0,1].indexOf(dx) > -1)
        && ([-1,0,1].indexOf(dy) > -1)
        && !(dx === 0 && dy === 0);
    });

    await playFloorFireAnimation(unit, adjacentUnits);

    for (const adjacentUnit of adjacentUnits) {
      await adjacentUnit.takeDamage(damage, unit);
    }
  };

  return new InventoryItem('Scroll of Floor Fire', ItemCategory.SCROLL, onUse);
};

const _createMapEquipment = async (equipmentClass: EquipmentClass, { x, y }: Coordinates): Promise<MapItem> => {
  const sprite = await SpriteFactory.createStaticSprite(equipmentClass.mapIcon, equipmentClass.paletteSwaps);
  const inventoryItem: InventoryItem = await _createInventoryWeapon(equipmentClass);
  return new MapItem({ x, y }, equipmentClass.char, sprite, inventoryItem);
};

const _createInventoryWeapon = async (equipmentClass: EquipmentClass): Promise<InventoryItem> => {
  const onUse: ItemProc = (item: InventoryItem, unit: Unit) => {
    return equipItem(item, equipmentClass, unit);
  };
  return new InventoryItem(equipmentClass.name, equipmentClass.itemCategory, onUse);
};

const createEquipment = async (name: string): Promise<Equipment> => {
  const equipmentClass = EquipmentClass.forName(name);
  const sprite = await SpriteFactory.createEquipmentSprite(equipmentClass.sprite, equipmentClass.paletteSwaps);
  const equipment = await new Equipment(EquipmentClass.forName(name), sprite, null);
  sprite.target = equipment;
  return equipment;
};

type MapItemSupplier = ({ x, y }: Coordinates) => Promise<MapItem>;

const _getItemSuppliers = (level: number): MapItemSupplier[] => {
  const createMapPotion: MapItemSupplier = async ({ x, y }: Coordinates) => {
    const sprite = await SpriteFactory.createStaticSprite('map_potion');
    const inventoryItem = createPotion(40);
    return new MapItem({ x, y }, 'K', sprite, inventoryItem);
  };

  const createFloorFireScroll = async ({ x, y }: Coordinates): Promise<MapItem> => {
    const sprite = await SpriteFactory.createStaticSprite('map_scroll');
    const inventoryItem = await createScrollOfFloorFire(80);
    return new MapItem({ x, y }, 'K', sprite, inventoryItem);
  };

  return [createMapPotion, createFloorFireScroll];
};

const _getEquipmentSuppliers = (level: number): MapItemSupplier[] => {
  return EquipmentClass.values()
    .filter(equipmentClass => level >= equipmentClass.minLevel)
    .filter(equipmentClass => level <= equipmentClass.maxLevel)
    .map(equipmentClass => ({ x, y }) => _createMapEquipment(equipmentClass, { x, y }));
};

const createRandomItem = async ({ x, y }: Coordinates, level: number): Promise<MapItem> => {
  let supplier: MapItemSupplier;
  if (randInt(0, 2) == 0) {
    supplier = randChoice(_getItemSuppliers(level))!!;
  } else {
    supplier = randChoice(_getEquipmentSuppliers(level))!!;
  }
  return supplier({ x, y });
};

export default {
  createEquipment,
  createRandomItem
};
