import PaletteSwaps from '../graphics/PaletteSwaps';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import Coordinates from '../geometry/Coordinates';
import Unit from '../entities/units/Unit';
import Equipment from '../equipment/Equipment';
import { loadEquipmentModel, loadItemModel } from '../utils/models';
import InventoryItem from './InventoryItem';
import MapItem from '../entities/objects/MapItem';
import ConsumableItemModel from '../schemas/ConsumableItemModel';
import EquipmentModel from '../schemas/EquipmentModel';
import AnimationFactory from '../graphics/animations/AnimationFactory';
import { playAnimation } from '../graphics/animations/playAnimation';
import { dealDamage } from '../actions/dealDamage';
import { equipItem } from '../actions/equipItem';
import ImageFactory from '../graphics/images/ImageFactory';
import type { ItemProc, ItemProcContext } from './ItemProc';
import { die } from '../actions/die';
import { recordKill } from '../actions/recordKill';

const createLifePotion = (lifeRestored: number): InventoryItem => {
  const onUse: ItemProc = async (
    item: InventoryItem,
    unit: Unit,
    { game, ticker }: ItemProcContext
  ) => {
    playSound(Sounds.USE_POTION);
    const lifeGained = unit.gainLife(lifeRestored);
    ticker.log(
      `${unit.getName()} used ${item.name} and gained ${lifeGained} life.`,
      { turn: game.getTurn() }
    );
  };

  return new InventoryItem({
    name: 'Life Potion',
    category: 'POTION',
    onUse
  });
};

const createManaPotion = (manaRestored: number): InventoryItem => {
  const onUse: ItemProc = async (
    item: InventoryItem,
    unit: Unit,
    { game, ticker }: ItemProcContext
  ) => {
    playSound(Sounds.USE_POTION);
    const manaGained = unit.gainMana(manaRestored);
    ticker.log(
      `${unit.getName()} used ${item.name} and gained ${manaGained} mana.`,
      { turn: game.getTurn() }
    );
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
  const onUse: ItemProc = async (
    item: InventoryItem,
    unit: Unit,
    { game, map, imageFactory, ticker }: ItemProcContext
  ) => {
    // TODO - optimization opportunity
    const adjacentUnits: Unit[] = map.getAllUnits()
      .filter(u => {
        const { dx, dy } = Coordinates.difference(unit.getCoordinates(), u.getCoordinates());
        return ([-1,0,1].includes(dx))
          && ([-1,0,1].includes(dy))
          && !(dx === 0 && dy === 0);
      });

    playSound(Sounds.PLAYER_HITS_ENEMY);
    const animation = await AnimationFactory.getFloorFireAnimation(
      unit,
      adjacentUnits,
      { map, imageFactory }
    );
    await playAnimation(animation, { map });

    for (const adjacentUnit of adjacentUnits) {
      await dealDamage(damage, {
        sourceUnit: unit,
        targetUnit: adjacentUnit
      });

      if (adjacentUnit.getLife() <= 0) {
        await die(adjacentUnit, { game, map, imageFactory, ticker });
        recordKill(unit, { game, ticker });
      }
    }
  };

  return new InventoryItem({
    name: 'Scroll of Floor Fire',
    category: 'SCROLL',
    onUse
  });
};

const createInventoryEquipment = async (equipmentClass: string): Promise<InventoryItem> => {
  const onUse: ItemProc = async (
    item: InventoryItem,
    unit: Unit,
    { game, imageFactory, ticker }: ItemProcContext
  ) => {
    const equipment = await createEquipment(equipmentClass, { imageFactory });
    return equipItem(item, equipment, unit, { game, ticker });
  };

  const model = await loadEquipmentModel(equipmentClass);
  return new InventoryItem({
    name: model.name,
    category: model.itemCategory,
    onUse
  });
};

type CreateMapEquipmentContext = Readonly<{
  imageFactory: ImageFactory
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
  imageFactory: ImageFactory
}>;

const createEquipment = async (equipmentClass: string, { imageFactory }: CreateEquipmentContext): Promise<Equipment> => {
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
        case 'floor_fire':
          const damage = parseInt(model.params?.damage ?? '0');
          return createScrollOfFloorFire(damage);
        default:
          throw new Error(`Unknown spell: ${JSON.stringify(spell)}`);
      }
    }
    default:
      throw new Error(`Invalid item definition: ${JSON.stringify(model)}`);
  }
};

type CreateMapItemContext = Readonly<{
  imageFactory: ImageFactory
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
  const requireContext = require.context(
    '../../../data/items',
    false,
    /\.json$/i
  );

  const models: ConsumableItemModel[] = [];
  for (const filename of requireContext.keys()) {
    const model = await requireContext(filename) as ConsumableItemModel;
    models.push(model);
  }
  return models;
};

const loadAllEquipmentModels = async (): Promise<EquipmentModel[]> => {
  const requireContext = require.context(
    '../../../data/equipment',
    false,
    /\.json$/i
  );

  const models: EquipmentModel[] = [];
  for (const filename of requireContext.keys()) {
    const model = await requireContext(filename) as EquipmentModel;
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