import { EquipmentModel } from '../../gen-schema/equipment.schema';
import { GameEngine } from '../core/GameEngine';
import GameState from '../core/GameState';
import { playFloorFireAnimation } from '../graphics/animations/Animations';
import PaletteSwaps from '../graphics/PaletteSwaps';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import { isAdjacent } from '../maps/MapUtils';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import Coordinates from '../geometry/Coordinates';
import Unit from '../units/Unit';
import Equipment from '../equipment/Equipment';
import { loadEquipmentModel } from '../utils/models';
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

  return new InventoryItem({
    name: 'Life Potion',
    category: 'POTION',
    onUse
  });
};

const createManaPotion = (manaRestored: number): InventoryItem => {
  const onUse: ItemProc = async (item: InventoryItem, unit: Unit) => {
    playSound(Sounds.USE_POTION);
    const manaGained = unit.gainMana(manaRestored);
    GameState.getInstance().logMessage(`${unit.getName()} used ${item.name} and gained ${manaGained} mana.`);
  };

  return new InventoryItem({
    name: 'Mana Potion',
    category: 'POTION',
    onUse
  });
};

const createKey = (): InventoryItem => {
  const onUse: ItemProc = async () => {}; // TODO - for now just use these by walking into a door

  return new InventoryItem({
    name: 'Key',
    category: 'KEY',
    onUse
  });
};

const createScrollOfFloorFire = async (damage: number): Promise<InventoryItem> => {
  const onUse: ItemProc = async (item, unit): Promise<void> => {
    const engine = GameEngine.getInstance();
    const state = GameState.getInstance();
    const map = state.getMap();

    const adjacentUnits: Unit[] = map.units.filter(u => {
      const { dx, dy } = Coordinates.difference(unit.getCoordinates(), u.getCoordinates());
      return ([-1,0,1].includes(dx))
        && ([-1,0,1].includes(dy))
        && !(dx === 0 && dy === 0);
    });

    playSound(Sounds.PLAYER_HITS_ENEMY);
    await playFloorFireAnimation(unit, adjacentUnits);

    for (const adjacentUnit of adjacentUnits) {
      await engine.dealDamage(damage, {
        sourceUnit: unit,
        targetUnit: unit
      });
    }
  };

  return new InventoryItem({
    name: 'Scroll of Floor Fire',
    category: 'SCROLL',
    onUse
  });
};

const createMapEquipment = async (equipmentClass: string, { x, y }: Coordinates): Promise<MapItem> => {
  const model = await loadEquipmentModel(equipmentClass);
  const sprite = await SpriteFactory.createStaticSprite(model.mapIcon, PaletteSwaps.create(model.paletteSwaps));
  const inventoryItem: InventoryItem = await _createInventoryWeapon(equipmentClass);
  return new MapItem({ x, y, sprite, inventoryItem });
};

const _createInventoryWeapon = async (equipmentClass: string): Promise<InventoryItem> => {
  const onUse: ItemProc = (item: InventoryItem, unit: Unit) => {
    return equipItem(item, equipmentClass, unit);
  };
  const model = await loadEquipmentModel(equipmentClass);
  return new InventoryItem({
    name: model.name,
    category: model.itemCategory,
    onUse
  });
};

const createEquipment = async (equipmentClass: string): Promise<Equipment> => {
  const model = await loadEquipmentModel(equipmentClass);
  const spriteName = model.sprite;
  const sprite = await SpriteFactory.createEquipmentSprite(spriteName, PaletteSwaps.create(model.paletteSwaps));
  const inventoryItem = (model.itemCategory === 'WEAPON')
    ? await _createInventoryWeapon(equipmentClass)
    : null;
  const equipment = new Equipment({ model, sprite, inventoryItem });
  sprite.target = equipment;
  return equipment;
};

const createMapItem = async (itemClassId: string, { x, y }: Coordinates) => {
  const itemClass = ItemClass.load(itemClassId);
  const inventoryItem = await itemClass.getInventoryItem();
  const sprite = await SpriteFactory.createStaticSprite(itemClass.mapSprite, itemClass.paletteSwaps);
  return new MapItem({ x, y, sprite, inventoryItem });
};

const loadAllEquipmentModels = async (): Promise<EquipmentModel[]> => {
  const requireContext = require.context(
    '../../../data/equipment',
    false,
    /\.json$/i
  );

  return Promise.all(
    requireContext.keys()
      .map(filename => requireContext(filename) as EquipmentModel)
  );
};

export default {
  createEquipment,
  createKey,
  createMapEquipment,
  createMapItem,
  createLifePotion,
  createManaPotion,
  createScrollOfFloorFire,
  loadAllEquipmentModels
};
