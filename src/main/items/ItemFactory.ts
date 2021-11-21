import GameState from '../core/GameState';
import { playFloorFireAnimation } from '../graphics/animations/Animations';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import { Coordinates, ItemCategory } from '../types/types';
import Unit from '../units/Unit';
import { randChoice, randInt } from '../utils/random';
import Equipment from './equipment/Equipment';
import EquipmentModel from './equipment/EquipmentModel';
import InventoryItem from './InventoryItem';
import { equipItem } from './ItemUtils';
import MapItem from './MapItem';

type ItemProc = (item: InventoryItem, unit: Unit) => Promise<void>;

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

const _createMapEquipment = async (model: EquipmentModel, { x, y }: Coordinates): Promise<MapItem> => {
  const sprite = await SpriteFactory.createStaticSprite(model.mapIcon, model.paletteSwaps);
  const inventoryItem: InventoryItem = await _createInventoryWeapon(model);
  return new MapItem({ x, y }, model.char, sprite, inventoryItem);
};

const _createInventoryWeapon = async (model: EquipmentModel): Promise<InventoryItem> => {
  const onUse: ItemProc = (item: InventoryItem, unit: Unit) => {
    return equipItem(item, model, unit);
  };
  return new InventoryItem(model.name, model.itemCategory, onUse);
};

const createEquipment = async (id: string): Promise<Equipment> => {
  const equipmentModel = await EquipmentModel.forId(id);
  const spriteName = equipmentModel.sprite;
  const sprite = await SpriteFactory.createEquipmentSprite(spriteName, equipmentModel.paletteSwaps);
  const equipment = new Equipment(equipmentModel, sprite, null);
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

const _getEquipmentSuppliers = async (level: number): Promise<MapItemSupplier[]> => {
  const ids = [
    'bronze_chain_mail', 'bronze_sword', 'fire_sword', 'iron_chain_mail', 'iron_helmet', 'iron_sword',
    'long_bow', 'short_bow', 'steel_sword'
  ];

  const equipmentModels = await Promise.all(ids.map(id => EquipmentModel.forId(id)));
  return equipmentModels
    .filter(model => level >= model.minLevel)
    .filter(model => level <= model.maxLevel)
    .map(model => ({ x, y }) => _createMapEquipment(model, { x, y }));
};

const createRandomItem = async ({ x, y }: Coordinates, level: number): Promise<MapItem> => {
  let supplier: MapItemSupplier;
  if (randInt(0, 2) === 0) {
    supplier = randChoice(_getItemSuppliers(level))!!;
  } else {
    supplier = randChoice(await _getEquipmentSuppliers(level))!!;
  }
  return supplier({ x, y });
};

export default {
  createEquipment,
  createRandomItem
};
