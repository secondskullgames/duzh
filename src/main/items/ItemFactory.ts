import InventoryItem from './InventoryItem';
import PaletteSwaps from '../graphics/PaletteSwaps';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import Coordinates from '../geometry/Coordinates';
import Unit from '../entities/units/Unit';
import Equipment from '../equipment/Equipment';
import { loadEquipmentModel, loadItemModel } from '../utils/models';
import MapItem from '../entities/objects/MapItem';
import ConsumableItemModel from '../schemas/ConsumableItemModel';
import EquipmentModel from '../schemas/EquipmentModel';
import { equipItem } from '../actions/equipItem';
import ImageFactory from '../graphics/images/ImageFactory';
import { getEquipmentTooltip } from '../equipment/getEquipmentTooltip';
import { shootFireball } from '../actions/shootFireball';
import { GameScreen } from '../core/GameScreen';
import { floorFire } from '../actions/floorFire';
import type { ItemProc, ItemProcContext } from './ItemProc';

const createLifePotion = (lifeRestored: number): InventoryItem => {
  const onUse: ItemProc = async (
    item: InventoryItem,
    unit: Unit,
    { session }: ItemProcContext
  ) => {
    playSound(Sounds.USE_POTION);
    const lifeGained = unit.gainLife(lifeRestored);
    session
      .getTicker()
      .log(`${unit.getName()} used ${item.name} and gained ${lifeGained} life.`, {
        turn: session.getTurn()
      });
  };

  return new InventoryItem({
    name: 'Life Potion',
    category: 'POTION',
    onUse,
    tooltip: `Restores ${lifeRestored} life`
  });
};

const createManaPotion = (manaRestored: number): InventoryItem => {
  const onUse: ItemProc = async (
    item: InventoryItem,
    unit: Unit,
    { session }: ItemProcContext
  ) => {
    playSound(Sounds.USE_POTION);
    const manaGained = unit.gainMana(manaRestored);
    session
      .getTicker()
      .log(`${unit.getName()} used ${item.name} and gained ${manaGained} mana.`, {
        turn: session.getTurn()
      });
  };

  return new InventoryItem({
    name: 'Mana Potion',
    category: 'POTION',
    onUse,
    tooltip: `Restores ${manaRestored} mana`
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
  const onUse: ItemProc = async (
    item: InventoryItem,
    unit: Unit,
    { state, map, session }: ItemProcContext
  ) => {
    session.setScreen(GameScreen.GAME);
    await floorFire(unit, damage, { state, map, session });
  };

  return new InventoryItem({
    name: 'Scroll of Floor Fire',
    category: 'SCROLL',
    onUse,
    tooltip: [
      'Unleashes a wave of fire',
      'in all directions that',
      `deals ${damage} damage`
    ].join('\n')
  });
};

const createScrollOfFireball = async (damage: number): Promise<InventoryItem> => {
  const onUse: ItemProc = async (
    _item: InventoryItem,
    unit: Unit,
    { session }: ItemProcContext
  ) => {
    session.setScreen(GameScreen.GAME);
    await shootFireball(unit, unit.getDirection(), damage, session);
  };

  return new InventoryItem({
    name: 'Scroll of Fireball',
    category: 'SCROLL',
    onUse,
    tooltip: ['Shoots a fireball that deals', `${damage} damage`].join('\n')
  });
};

const createInventoryEquipment = async (
  equipmentClass: string
): Promise<InventoryItem> => {
  const onUse: ItemProc = async (
    item: InventoryItem,
    unit: Unit,
    { state, session }: ItemProcContext
  ) => {
    const equipment = await createEquipment(equipmentClass, {
      imageFactory: session.getImageFactory()
    });
    return equipItem(item, equipment, unit, { state, session });
  };

  const model = await loadEquipmentModel(equipmentClass);
  return new InventoryItem({
    name: model.name,
    category: model.itemCategory,
    onUse,
    tooltip: getEquipmentTooltip(model)
  });
};

type CreateMapEquipmentContext = Readonly<{
  imageFactory: ImageFactory;
}>;

const createMapEquipment = async (
  equipmentClass: string,
  coordinates: Coordinates,
  { imageFactory }: CreateMapEquipmentContext
): Promise<MapItem> => {
  const model = await loadEquipmentModel(equipmentClass);
  const sprite = await SpriteFactory.createStaticSprite(
    model.mapIcon,
    PaletteSwaps.create(model.paletteSwaps),
    { imageFactory }
  );
  const inventoryItem: InventoryItem = await createInventoryEquipment(equipmentClass);
  return new MapItem({ coordinates, sprite, inventoryItem });
};

type CreateEquipmentContext = Readonly<{
  imageFactory: ImageFactory;
}>;

const createEquipment = async (
  equipmentClass: string,
  { imageFactory }: CreateEquipmentContext
): Promise<Equipment> => {
  const model = await loadEquipmentModel(equipmentClass);
  const spriteName = model.sprite;
  const sprite = await SpriteFactory.createEquipmentSprite(
    spriteName,
    PaletteSwaps.create(model.paletteSwaps),
    { imageFactory }
  );

  // TODO wtf is this
  const inventoryItem = await createInventoryEquipment(equipmentClass);
  const equipment = new Equipment({ model, sprite, inventoryItem });
  sprite.bind(equipment);
  return equipment;
};

const createInventoryItem = async (
  model: ConsumableItemModel
): Promise<InventoryItem> => {
  switch (model.type) {
    case 'life_potion': {
      const amount = parseInt(model.params?.amount ?? '0');
      return createLifePotion(amount);
    }
    case 'mana_potion': {
      const amount = parseInt(model.params?.amount ?? '0');
      return createManaPotion(amount);
    }
    case 'key': {
      return createKey();
    }
    case 'scroll': {
      const spell = model.params?.spell;
      switch (spell) {
        case 'floor_fire': {
          const damage = parseInt(model.params?.damage ?? '0');
          return createScrollOfFloorFire(damage);
        }
        case 'fireball': {
          const damage = parseInt(model.params?.damage ?? '0');
          return createScrollOfFireball(damage);
        }
        default:
          throw new Error(`Unknown spell: ${JSON.stringify(spell)}`);
      }
    }
    default:
      throw new Error(`Invalid item definition: ${JSON.stringify(model)}`);
  }
};

type CreateMapItemContext = Readonly<{
  imageFactory: ImageFactory;
}>;

const createMapItem = async (
  itemId: string,
  coordinates: Coordinates,
  { imageFactory }: CreateMapItemContext
) => {
  const model: ConsumableItemModel = await loadItemModel(itemId);
  const inventoryItem = await createInventoryItem(model);
  const sprite = await SpriteFactory.createStaticSprite(
    model.mapSprite,
    PaletteSwaps.create(model.paletteSwaps),
    { imageFactory }
  );
  return new MapItem({ coordinates, sprite, inventoryItem });
};

const loadAllConsumableModels = async (): Promise<ConsumableItemModel[]> => {
  const requireContext = require.context('../../../data/items', false, /\.json$/i);

  const models: ConsumableItemModel[] = [];
  for (const filename of requireContext.keys()) {
    const model = (await requireContext(filename)) as ConsumableItemModel;
    models.push(model);
  }
  return models;
};

const loadAllEquipmentModels = async (): Promise<EquipmentModel[]> => {
  const requireContext = require.context('../../../data/equipment', false, /\.json$/i);

  const models: EquipmentModel[] = [];
  for (const filename of requireContext.keys()) {
    const model = (await requireContext(filename)) as EquipmentModel;
    models.push(model);
  }
  return models;
};

export default {
  createEquipment,
  createInventoryEquipment,
  createMapItem,
  createMapEquipment,
  loadAllConsumableModels,
  loadAllEquipmentModels
};
