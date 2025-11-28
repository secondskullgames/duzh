import { Coordinates } from '@duzh/geometry';
import {
  AssetBundle,
  ConsumableItemModel,
  ConsumableType,
  ItemCategory
} from '@duzh/models';
import { checkNotNull } from '@duzh/utils/preconditions';
import { castFreeze } from '@main/actions/castFreeze';
import { equipItem } from '@main/actions/equipItem';
import { floorFire } from '@main/actions/floorFire';
import { radialChainLightning } from '@main/actions/radialChainLightning';
import { shootFireball } from '@main/actions/shootFireball';
import { Game } from '@main/core/Game';
import { getEquipmentTooltip } from '@main/equipment/EquipmentUtils';
import { loadPaletteSwaps } from '@main/graphics/loadPaletteSwaps';
import { revealMap } from '@main/maps/MapUtils';
import { SceneName } from '@main/scenes/SceneName';
import Equipment from '../equipment/Equipment';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import MapInstance from '../maps/MapInstance';
import MapItem from '../objects/MapItem';
import Unit from '../units/Unit';
import InventoryItem from './InventoryItem';
import type { ItemProc } from './ItemProc';

export class ItemFactory {
  constructor(
    private readonly assetBundle: AssetBundle,
    private readonly spriteFactory: SpriteFactory
  ) {}

  createLifePotion = (lifeRestored: number): InventoryItem => {
    const onUse: ItemProc = async (item: InventoryItem, unit: Unit, game: Game) => {
      const { soundController, state, ticker } = game;
      soundController.playSound('use_potion');
      const lifeGained = unit.gainLife(lifeRestored);
      ticker.log(`${unit.getName()} used ${item.name} and gained ${lifeGained} life.`, {
        turn: state.getTurn()
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
    const onUse: ItemProc = async (item: InventoryItem, unit: Unit, game: Game) => {
      const { soundController, state, ticker } = game;
      soundController.playSound('use_potion');
      const manaGained = unit.gainMana(manaRestored);
      ticker.log(`${unit.getName()} used ${item.name} and gained ${manaGained} mana.`, {
        turn: state.getTurn()
      });
    };

    return new InventoryItem({
      name,
      category: ItemCategory.POTION,
      onUse,
      tooltip: `Restores ${manaRestored} mana`
    });
  };

  createOverdrivePotion = (name: string, duration: number): InventoryItem => {
    const onUse: ItemProc = async (item: InventoryItem, unit: Unit, game: Game) => {
      const { soundController, state, ticker } = game;
      soundController.playSound('use_potion');
      unit.setOverdrive(duration);
      ticker.log(
        `${unit.getName()} used ${item.name}.  Abilities are free for ${duration} turns.`,
        {
          turn: state.getTurn()
        }
      );
    };

    return new InventoryItem({
      name,
      category: ItemCategory.POTION,
      onUse,
      tooltip: `All abilities are free for the next ${duration} turns`
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
    const onUse: ItemProc = async (_: InventoryItem, unit: Unit, game: Game) => {
      const { state } = game;
      state.setScene(SceneName.GAME);
      await floorFire(unit, damage, game);
    };

    return new InventoryItem({
      name,
      category: ItemCategory.SCROLL,
      onUse,
      tooltip: `Unleashes a wave of fire in all directions that deals ${damage} damage`
    });
  };

  createScrollOfChainLightning = async (
    name: string,
    damage: number
  ): Promise<InventoryItem> => {
    const onUse: ItemProc = async (_: InventoryItem, unit: Unit, game: Game) => {
      const { state } = game;
      state.setScene(SceneName.GAME);
      await radialChainLightning(unit, damage, game);
    };

    return new InventoryItem({
      name,
      category: ItemCategory.SCROLL,
      onUse,
      tooltip: `Unleashes a wave of chain lightning in all directions that deals ${damage} damage`
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
      tooltip: 'Reveals the entire map'
    });
  };

  createScrollOfFireball = async (
    name: string,
    damage: number
  ): Promise<InventoryItem> => {
    const onUse: ItemProc = async (_: InventoryItem, unit: Unit, game: Game) => {
      game.state.setScene(SceneName.GAME);
      await shootFireball(unit, unit.getDirection(), damage, game);
    };

    return new InventoryItem({
      name,
      category: ItemCategory.SCROLL,
      onUse,
      tooltip: `Shoots a fireball that deals ${damage} damage`
    });
  };

  createScrollOfFreeze = async (
    name: string,
    duration: number
  ): Promise<InventoryItem> => {
    const onUse: ItemProc = async (_: InventoryItem, unit: Unit, game: Game) => {
      game.state.setScene(SceneName.GAME);
      await castFreeze(unit, 5, duration, game);
    };

    return new InventoryItem({
      name,
      category: ItemCategory.SCROLL,
      onUse,
      tooltip: `Freezes nearby enemies for ${duration} turns`
    });
  };

  createInventoryEquipment = async (modelId: string): Promise<InventoryItem> => {
    const onUse: ItemProc = async (_: InventoryItem, unit: Unit, game: Game) => {
      const equipment = await this.createEquipment(modelId);
      return equipItem(equipment, unit, game);
    };

    const model = checkNotNull(this.assetBundle.equipment[modelId]);
    return new InventoryItem({
      name: model.name,
      category: model.itemCategory,
      onUse,
      tooltip: getEquipmentTooltip(model)
    });
  };

  createMapEquipment = async (
    modelId: string,
    coordinates: Coordinates,
    map: MapInstance
  ): Promise<MapItem> => {
    const model = checkNotNull(this.assetBundle.equipment[modelId]);
    const sprite = await this.spriteFactory.createStaticSprite(
      model.mapIcon,
      loadPaletteSwaps(model.paletteSwaps, this.assetBundle)
    );
    const inventoryItem: InventoryItem = await this.createInventoryEquipment(modelId);
    return new MapItem({
      name: inventoryItem.name,
      coordinates,
      map,
      sprite,
      inventoryItem
    });
  };

  createEquipment = async (modelId: string): Promise<Equipment> => {
    const model = checkNotNull(this.assetBundle.equipment[modelId]);
    const spriteName = model.sprite;
    const sprite = await this.spriteFactory.createEquipmentSprite(
      spriteName,
      loadPaletteSwaps(model.paletteSwaps, this.assetBundle)
    );

    // TODO wtf is this
    const inventoryItem = await this.createInventoryEquipment(modelId);
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
      case ConsumableType.OVERDRIVE_POTION: {
        const duration = parseInt(model.params?.duration ?? '0');
        return this.createOverdrivePotion(model.name, duration);
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
          case 'chain_lightning': {
            const damage = parseInt(model.params?.damage ?? '0');
            return this.createScrollOfChainLightning(model.name, damage);
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
    const model = checkNotNull(this.assetBundle.items[itemId]);
    const inventoryItem = await this.createInventoryItem(model);
    const sprite = await this.spriteFactory.createStaticSprite(
      model.mapSprite,
      loadPaletteSwaps(model.paletteSwaps, this.assetBundle)
    );
    return new MapItem({ name: model.name, coordinates, map, sprite, inventoryItem });
  };
}
