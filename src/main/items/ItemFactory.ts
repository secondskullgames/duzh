import GameState from '../core/GameState';
import { playFloorFireAnimation } from '../graphics/animations/Animations';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import Coordinates from '../types/Coordinates';
import { ItemCategory } from '../types/types';
import Unit from '../units/Unit';
import { randChoice } from '../utils/random';
import Equipment from './equipment/Equipment';
import EquipmentClass from './equipment/EquipmentClass';
import InventoryItem from './InventoryItem';
import ItemClass from './ItemClass';
import { equipItem } from './ItemUtils';
import MapItem from './MapItem';

type ItemProc = (item: InventoryItem, unit: Unit) => Promise<void>;
const EQUIPMENT_FREQUENCY = 0.7;

const createPotion = (lifeRestored: number): InventoryItem => {
  const onUse: ItemProc = async (item: InventoryItem, unit: Unit) => {
    playSound(Sounds.USE_POTION);
    const prevLife = unit.life;
    unit.life = Math.min(unit.life + lifeRestored, unit.maxLife);
    GameState.getInstance().messages.push(`${unit.name} used ${item.name} and gained ${(unit.life - prevLife)} life.`);
  };

  return new InventoryItem('Potion', ItemCategory.POTION, onUse);
};

const createScrollOfFloorFire = async (damage: number): Promise<InventoryItem> => {
  const onUse: ItemProc = async (item, unit): Promise<void> => {
    const map = GameState.getInstance().getMap();

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

const _createMapEquipment = async (model: EquipmentClass, { x, y }: Coordinates): Promise<MapItem> => {
  const sprite = await SpriteFactory.createStaticSprite(model.mapIcon, model.paletteSwaps);
  const inventoryItem: InventoryItem = await _createInventoryWeapon(model);
  return new MapItem({ x, y }, model.char, sprite, inventoryItem);
};

const _createInventoryWeapon = async (model: EquipmentClass): Promise<InventoryItem> => {
  const onUse: ItemProc = (item: InventoryItem, unit: Unit) => {
    return equipItem(item, model, unit);
  };
  return new InventoryItem(model.name, model.itemCategory, onUse);
};

const createEquipment = async (equipmentClass: EquipmentClass): Promise<Equipment> => {
  const spriteName = equipmentClass.sprite;
  const sprite = await SpriteFactory.createEquipmentSprite(spriteName, equipmentClass.paletteSwaps);
  const equipment = new Equipment(equipmentClass, sprite, null);
  sprite.target = equipment;
  return equipment;
};

const _createMapItem = async (itemClass: ItemClass, { x, y }: Coordinates) => {
  const inventoryItem = await itemClass.getInventoryItem();
  const sprite = await SpriteFactory.createStaticSprite(itemClass.mapSprite);
  return new MapItem({ x, y }, 'K', sprite, inventoryItem);
};

const createRandomItem = (
  equipmentClasses: EquipmentClass[],
  itemClasses: ItemClass[],
  { x, y }: Coordinates
): Promise<MapItem> => {
  if (Math.random() <= EQUIPMENT_FREQUENCY) {
    const equipmentClass = randChoice(equipmentClasses);
    return _createMapEquipment(equipmentClass, { x, y });
  } else {
    const itemClass = randChoice(itemClasses);
    return _createMapItem(itemClass, { x, y });
  }
};

export default {
  createEquipment,
  createPotion,
  createScrollOfFloorFire,
  createRandomItem
};
