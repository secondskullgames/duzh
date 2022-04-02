import GameState from '../core/GameState';
import EquipmentClass from '../equipment/EquipmentClass';
import { playFloorFireAnimation } from '../graphics/animations/Animations';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import Coordinates from '../geometry/Coordinates';
import Unit from '../units/Unit';
import { randChoice } from '../utils/random';
import Equipment from '../equipment/Equipment';
import InventoryItem from './InventoryItem';
import ItemModel from './ItemModel';
import { equipItem } from './ItemUtils';
import MapItem from '../objects/MapItem';

type ItemProc = (item: InventoryItem, unit: Unit) => Promise<void>;
const EQUIPMENT_FREQUENCY = 0.7;

const createPotion = (lifeRestored: number): InventoryItem => {
  const onUse: ItemProc = async (item: InventoryItem, unit: Unit) => {
    playSound(Sounds.USE_POTION);
    const prevLife = unit.life;
    unit.life = Math.min(unit.life + lifeRestored, unit.maxLife);
    GameState.getInstance().pushMessage(`${unit.name} used ${item.name} and gained ${(unit.life - prevLife)} life.`);
  };

  return new InventoryItem('Potion', 'POTION', onUse);
};

const createKey = (): InventoryItem => {
  const onUse: ItemProc = async () => {}; // TODO - for now just use these by walking into a door

  return new InventoryItem('Key', 'KEY', onUse);
};

const createScrollOfFloorFire = async (damage: number): Promise<InventoryItem> => {
  const onUse: ItemProc = async (item, unit): Promise<void> => {
    const map = GameState.getInstance().getMap();

    const adjacentUnits: Unit[] = map.units.filter(u => {
      const dx = unit.x - u.x;
      const dy = unit.y - u.y;
      return ([-1,0,1].includes(dx))
        && ([-1,0,1].includes(dy))
        && !(dx === 0 && dy === 0);
    });

    await playFloorFireAnimation(unit, adjacentUnits);

    for (const adjacentUnit of adjacentUnits) {
      await adjacentUnit.takeDamage(damage, unit);
    }
  };

  return new InventoryItem('Scroll of Floor Fire', 'SCROLL', onUse);
};

const createMapEquipment = async (equipmentClass: EquipmentClass, { x, y }: Coordinates): Promise<MapItem> => {
  const sprite = await SpriteFactory.createStaticSprite(equipmentClass.mapIcon, equipmentClass.paletteSwaps);
  const inventoryItem: InventoryItem = await _createInventoryWeapon(equipmentClass);
  return new MapItem({ x, y, sprite, inventoryItem });
};

const _createInventoryWeapon = async (equipmentClass: EquipmentClass): Promise<InventoryItem> => {
  const onUse: ItemProc = (item: InventoryItem, unit: Unit) => {
    return equipItem(item, equipmentClass, unit);
  };
  return new InventoryItem(equipmentClass.name, equipmentClass.itemCategory, onUse);
};

const createEquipment = async (equipmentClass: EquipmentClass): Promise<Equipment> => {
  const spriteName = equipmentClass.sprite;
  const sprite = await SpriteFactory.createEquipmentSprite(spriteName, equipmentClass.paletteSwaps);
  const equipment = new Equipment({ equipmentClass, sprite });
  sprite.target = equipment;
  return equipment;
};

const createMapItem = async (itemClass: ItemModel, { x, y }: Coordinates) => {
  const inventoryItem = await itemClass.getInventoryItem();
  const sprite = await SpriteFactory.createStaticSprite(itemClass.mapSprite);
  return new MapItem({ x, y, sprite, inventoryItem });
};

const createRandomItemOrEquipment = (
  equipmentClasses: EquipmentClass[],
  itemClasses: ItemModel[],
  { x, y }: Coordinates
): Promise<MapItem> => {
  if (Math.random() <= EQUIPMENT_FREQUENCY) {
    const equipmentClass = randChoice(equipmentClasses);
    return createMapEquipment(equipmentClass, { x, y });
  } else {
    const itemClass = randChoice(itemClasses);
    return createMapItem(itemClass, { x, y });
  }
};

export default {
  createEquipment,
  createKey,
  createMapEquipment,
  createMapItem,
  createPotion,
  createRandomItemOrEquipment,
  createScrollOfFloorFire
};
