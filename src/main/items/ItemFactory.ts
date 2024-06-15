import InventoryItem from './InventoryItem';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import Sounds from '../sounds/Sounds';
import Unit from '../units/Unit';
import Equipment from '../equipment/Equipment';
import MapItem from '../objects/MapItem';
import MapInstance from '../maps/MapInstance';
import { ConsumableItemModel } from '@models/ConsumableItemModel';
import { Coordinates } from '@lib/geometry/Coordinates';
import ModelLoader from '@main/assets/ModelLoader';
import { equipItem } from '@main/actions/equipItem';
import { getEquipmentTooltip } from '@main/equipment/EquipmentUtils';
import { shootFireball } from '@main/actions/shootFireball';
import { GameScreen } from '@main/core/GameScreen';
import { floorFire } from '@main/actions/floorFire';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { revealMap } from '@main/maps/MapUtils';
import { castFreeze } from '@main/actions/castFreeze';
import { loadPaletteSwaps } from '@main/graphics/loadPaletteSwaps';
import { ConsumableType } from '@models/ConsumableType';
import { ItemCategory } from '@models/ItemCategory';
import { Feature } from '@main/utils/features';
import { checkState } from '@lib/utils/preconditions';
import { weightedRandom, WeightedRandomChoice } from '@lib/utils/random';
import { injectable } from 'inversify';
import type { ItemProc } from './ItemProc';

export enum ItemType {
  EQUIPMENT = 'equipment',
  CONSUMABLE = 'consumable'
}

export type ItemSpec = Readonly<{
  type: ItemType;
  id: string;
}>;

@injectable()
export default class ItemFactory {
  constructor(
    private readonly spriteFactory: SpriteFactory,
    private readonly modelLoader: ModelLoader
  ) {}

  createLifePotion = (lifeRestored: number): InventoryItem => {
    const onUse: ItemProc = async (
      item: InventoryItem,
      unit: Unit,
      state: GameState,
      session: Session
    ) => {
      state.getSoundPlayer().playSound(Sounds.USE_POTION);
      const lifeGained = unit.gainLife(lifeRestored);
      session
        .getTicker()
        .log(`${unit.getName()} used ${item.name} and gained ${lifeGained} life.`, {
          turn: session.getTurn()
        });
    };

    return new InventoryItem({
      name: 'Life Potion',
      category: ItemCategory.POTION,
      onUse,
      tooltip: `Restores ${lifeRestored} life`
    });
  };

  createManaPotion = (name: string, manaRestored: number): InventoryItem => {
    const onUse: ItemProc = async (
      item: InventoryItem,
      unit: Unit,
      state: GameState,
      session: Session
    ) => {
      state.getSoundPlayer().playSound(Sounds.USE_POTION);
      const manaGained = unit.gainMana(manaRestored);
      session
        .getTicker()
        .log(`${unit.getName()} used ${item.name} and gained ${manaGained} mana.`, {
          turn: session.getTurn()
        });
    };

    return new InventoryItem({
      name,
      category: ItemCategory.POTION,
      onUse,
      tooltip: `Restores ${manaRestored} mana`
    });
  };

  createKey = (name: string): InventoryItem => {
    const onUse: ItemProc = async () => {}; // TODO - for now just use these by walking into a door

    return new InventoryItem({
      name,
      category: ItemCategory.KEY,
      onUse
    });
  };

  createScrollOfFloorFire = async (
    name: string,
    damage: number
  ): Promise<InventoryItem> => {
    const onUse: ItemProc = async (
      _: InventoryItem,
      unit: Unit,
      state: GameState,
      session: Session
    ) => {
      session.setScreen(GameScreen.GAME);
      await floorFire(unit, damage, state, session);
    };

    return new InventoryItem({
      name,
      category: ItemCategory.SCROLL,
      onUse,
      tooltip: [
        'Unleashes a wave of fire',
        'in all directions that',
        `deals ${damage} damage`
      ].join('\n')
    });
  };

  createScrollOfVision = async (name: string): Promise<InventoryItem> => {
    const onUse: ItemProc = async (_: InventoryItem, unit: Unit) => {
      revealMap(unit.getMap());
    };

    return new InventoryItem({
      name,
      category: ItemCategory.SCROLL,
      onUse,
      tooltip: ['Reveals the entire map'].join('\n')
    });
  };

  createScrollOfFireball = async (
    name: string,
    damage: number
  ): Promise<InventoryItem> => {
    const onUse: ItemProc = async (
      _: InventoryItem,
      unit: Unit,
      state: GameState,
      session: Session
    ) => {
      session.setScreen(GameScreen.GAME);
      await shootFireball(unit, unit.getDirection(), damage, session, state);
    };

    return new InventoryItem({
      name,
      category: ItemCategory.SCROLL,
      onUse,
      tooltip: ['Shoots a fireball that deals', `${damage} damage`].join('\n')
    });
  };

  createScrollOfFreeze = async (
    name: string,
    duration: number
  ): Promise<InventoryItem> => {
    const onUse: ItemProc = async (
      _: InventoryItem,
      unit: Unit,
      state: GameState,
      session: Session
    ) => {
      session.setScreen(GameScreen.GAME);
      await castFreeze(unit, 5, duration, session, state);
    };

    return new InventoryItem({
      name,
      category: ItemCategory.SCROLL,
      onUse,
      tooltip: `Freezes nearby enemies for ${duration} turns`
    });
  };

  createInventoryEquipment = async (modelName: string): Promise<InventoryItem> => {
    const onUse: ItemProc = async (
      _: InventoryItem,
      unit: Unit,
      state: GameState,
      session: Session
    ) => {
      const equipment = await this.createEquipment(modelName);
      return equipItem(equipment, unit, session, state);
    };

    const model = await this.modelLoader.loadEquipmentModel(modelName);
    return new InventoryItem({
      name: model.name,
      category: model.itemCategory,
      onUse,
      tooltip: getEquipmentTooltip(model)
    });
  };

  createMapEquipment = async (
    modelName: string,
    coordinates: Coordinates,
    map: MapInstance
  ): Promise<MapItem> => {
    const model = await this.modelLoader.loadEquipmentModel(modelName);
    const sprite = await this.spriteFactory.createStaticSprite(
      model.mapIcon,
      loadPaletteSwaps(model.paletteSwaps)
    );
    const inventoryItem: InventoryItem = await this.createInventoryEquipment(modelName);
    return new MapItem({
      name: inventoryItem.name,
      coordinates,
      map,
      sprite,
      inventoryItem
    });
  };

  createEquipment = async (modelName: string): Promise<Equipment> => {
    const model = await this.modelLoader.loadEquipmentModel(modelName);
    const spriteName = model.sprite;
    const sprite = await this.spriteFactory.createEquipmentSprite(
      spriteName,
      loadPaletteSwaps(model.paletteSwaps)
    );

    // TODO wtf is this
    const inventoryItem = await this.createInventoryEquipment(modelName);
    const equipment = new Equipment({ model, sprite, inventoryItem });
    sprite.bind(equipment);
    return equipment;
  };

  createInventoryItem = async (model: ConsumableItemModel): Promise<InventoryItem> => {
    switch (model.type) {
      case ConsumableType.LIFE_POTION: {
        const amount = parseInt(model.params?.amount ?? '0');
        return this.createLifePotion(amount);
      }
      case ConsumableType.MANA_POTION: {
        const amount = parseInt(model.params?.amount ?? '0');
        return this.createManaPotion(model.name, amount);
      }
      case ConsumableType.KEY: {
        return this.createKey(model.name);
      }
      case ConsumableType.SCROLL: {
        const spell = model.params?.spell;
        switch (spell) {
          case 'floor_fire': {
            const damage = parseInt(model.params?.damage ?? '0');
            return this.createScrollOfFloorFire(model.name, damage);
          }
          case 'reveal_map': {
            return this.createScrollOfVision(model.name);
          }
          case 'fireball': {
            const damage = parseInt(model.params?.damage ?? '0');
            return this.createScrollOfFireball(model.name, damage);
          }
          case 'freeze': {
            const duration = parseInt(model.params?.duration ?? '0');
            return this.createScrollOfFreeze(model.name, duration);
          }
          default:
            throw new Error(`Unknown spell: ${JSON.stringify(spell)}`);
        }
      }
      default:
        throw new Error(`Invalid item definition: ${JSON.stringify(model)}`);
    }
  };

  createMapItem = async (itemId: string, coordinates: Coordinates, map: MapInstance) => {
    const model: ConsumableItemModel = await this.modelLoader.loadItemModel(itemId);
    const inventoryItem = await this.createInventoryItem(model);
    const sprite = await this.spriteFactory.createStaticSprite(
      model.mapSprite,
      loadPaletteSwaps(model.paletteSwaps)
    );
    return new MapItem({ name: model.name, coordinates, map, sprite, inventoryItem });
  };

  chooseRandomMapItemForLevel = async (
    levelNumber: number,
    state: GameState
  ): Promise<ItemSpec> => {
    const allEquipmentModels = await this.modelLoader.loadAllEquipmentModels();
    const allConsumableModels = await this.modelLoader.loadAllConsumableModels();
    const possibleEquipmentModels = allEquipmentModels
      .filter(equipmentModel => {
        if (Feature.isEnabled(Feature.DEDUPLICATE_EQUIPMENT)) {
          return !state.getGeneratedEquipmentIds().includes(equipmentModel.id);
        }
        return true;
      })
      .filter(
        equipmentModel => equipmentModel.level && equipmentModel.level <= levelNumber
      );

    const possibleItemModels = allConsumableModels.filter(
      itemModel => itemModel.level && itemModel.level <= levelNumber
    );

    const possibleItemSpecs: ItemSpec[] = [
      ...possibleEquipmentModels.map(model => ({
        type: ItemType.EQUIPMENT,
        id: model.id
      })),
      ...possibleItemModels.map(model => ({
        type: ItemType.CONSUMABLE,
        id: model.id
      }))
    ];

    checkState(possibleItemSpecs.length > 0);

    // weighted random
    const choices: WeightedRandomChoice<ItemSpec>[] = [];

    for (const itemSpec of possibleItemSpecs) {
      const key = `${itemSpec.type}_${itemSpec.id}`;
      const model = (() => {
        switch (itemSpec.type) {
          case ItemType.EQUIPMENT:
            return possibleEquipmentModels.find(
              equipmentModel => equipmentModel.id === itemSpec.id
            );
          case ItemType.CONSUMABLE:
            return possibleItemModels.find(itemClass => itemClass.id === itemSpec.id);
        }
      })();

      // Each rarity is 2x less common than the previous rarity.
      // So P[rarity] = 2 ^ -rarity
      const weight = 0.5 ** (model?.rarity ?? 0);
      choices.push({ weight, key, value: itemSpec });
    }
    return weightedRandom(choices);
  };
}
