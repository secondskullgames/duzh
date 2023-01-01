import GameState from '../core/GameState';
import EquipmentClass from '../equipment/EquipmentClass';
import { playFloorFireAnimation } from '../graphics/animations/Animations';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import Coordinates from '../geometry/Coordinates';
import Unit from '../units/Unit';
import Equipment from '../equipment/Equipment';
import InventoryItem from './InventoryItem';
import ItemClass from './ItemClass';
import { equipItem } from './ItemUtils';
import MapItem from '../objects/MapItem';

type ItemProc = (item: InventoryItem, unit: Unit) => Promise<void>;

const createLifePotion = (lifeRestored: number): InventoryItem => {
  const onUse: ItemProc = async (item: InventoryItem, unit: Unit) => {
    playSound(Sounds.USE_POTION);
    const lifeGained = unit.gainLife(lifeRestored);
    GameState.getInstance().logMessage(`${unit.getName()} used ${item.name} and gained ${lifeGained} life.`);
  };

  return new InventoryItem('Life Potion', 'POTION', onUse);
};

const createManaPotion = (manaRestored: number): InventoryItem => {
  const onUse: ItemProc = async (item: InventoryItem, unit: Unit) => {
    playSound(Sounds.USE_POTION);
    const manaGained = unit.gainMana(manaRestored);
    GameState.getInstance().logMessage(`${unit.getName()} used ${item.name} and gained ${manaGained} mana.`);
  };

  return new InventoryItem('Mana Potion', 'POTION', onUse);
};

const createKey = (): InventoryItem => {
  const onUse: ItemProc = async () => {}; // TODO - for now just use these by walking into a door

  return new InventoryItem('Key', 'KEY', onUse);
};

const createScrollOfFloorFire = async (damage: number): Promise<InventoryItem> => {
  const onUse: ItemProc = async (item, unit): Promise<void> => {
    const map = GameState.getInstance().getMap();

    const adjacentUnits: Unit[] = map.units.filter(u => {
      const { dx, dy } = Coordinates.difference(unit.getCoordinates(), u.getCoordinates());
      return ([-1,0,1].includes(dx))
        && ([-1,0,1].includes(dy))
        && !(dx === 0 && dy === 0);
    });

    await playSound(Sounds.PLAYER_HITS_ENEMY);
    await playFloorFireAnimation(unit, adjacentUnits);

    for (const adjacentUnit of adjacentUnits) {
      await adjacentUnit.takeDamage(damage, { sourceUnit: unit });
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
  const inventoryItem = (equipmentClass.itemCategory === 'WEAPON')
    ? await _createInventoryWeapon(equipmentClass)
    : null;
  const equipment = new Equipment({ equipmentClass, sprite, inventoryItem });
  sprite.target = equipment;
  return equipment;
};

const createMapItem = async (itemClass: ItemClass, { x, y }: Coordinates) => {
  const inventoryItem = await itemClass.getInventoryItem();
  const sprite = await SpriteFactory.createStaticSprite(itemClass.mapSprite, itemClass.paletteSwaps);
  return new MapItem({ x, y, sprite, inventoryItem });
};

export default {
  createEquipment,
  createKey,
  createMapEquipment,
  createMapItem,
  createLifePotion,
  createManaPotion,
  createScrollOfFloorFire
};
