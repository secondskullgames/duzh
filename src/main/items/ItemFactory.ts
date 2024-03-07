import InventoryItem from './InventoryItem';
import PaletteSwaps from '../graphics/PaletteSwaps';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import Sounds from '../sounds/Sounds';
import Coordinates from '../geometry/Coordinates';
import Unit from '../entities/units/Unit';
import Equipment from '../equipment/Equipment';
import MapItem from '../entities/objects/MapItem';
import ConsumableItemModel from '../schemas/ConsumableItemModel';
import MapInstance from '../maps/MapInstance';
import ModelLoader from '../utils/ModelLoader';
import { equipItem } from '@main/actions/equipItem';
import { getEquipmentTooltip } from '@main/equipment/getEquipmentTooltip';
import { shootFireball } from '@main/actions/shootFireball';
import { GameScreen } from '@main/core/GameScreen';
import { floorFire } from '@main/actions/floorFire';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { revealMap } from '@main/maps/MapUtils';
import { castFreeze } from '@main/actions/castFreeze';
import { injectable } from 'inversify';
import type { ItemProc } from './ItemProc';

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
      category: 'POTION',
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
      category: 'POTION',
      onUse,
      tooltip: `Restores ${manaRestored} mana`
    });
  };

  createKey = (name: string): InventoryItem => {
    const onUse: ItemProc = async () => {}; // TODO - for now just use these by walking into a door

    return new InventoryItem({
      name,
      category: 'KEY',
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
      category: 'SCROLL',
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
      category: 'SCROLL',
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
      category: 'SCROLL',
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
      category: 'SCROLL',
      onUse,
      tooltip: `Freezes nearby enemies for ${duration} turns`
    });
  };

  createInventoryEquipment = async (equipmentClass: string): Promise<InventoryItem> => {
    const onUse: ItemProc = async (
      _: InventoryItem,
      unit: Unit,
      state: GameState,
      session: Session
    ) => {
      const equipment = await this.createEquipment(equipmentClass);
      return equipItem(equipment, unit, session, state);
    };

    const model = await this.modelLoader.loadEquipmentModel(equipmentClass);
    return new InventoryItem({
      name: model.name,
      category: model.itemCategory,
      onUse,
      tooltip: getEquipmentTooltip(model)
    });
  };

  createMapEquipment = async (
    equipmentClass: string,
    coordinates: Coordinates,
    map: MapInstance
  ): Promise<MapItem> => {
    const model = await this.modelLoader.loadEquipmentModel(equipmentClass);
    const sprite = await this.spriteFactory.createStaticSprite(
      model.mapIcon,
      PaletteSwaps.create(model.paletteSwaps)
    );
    const inventoryItem: InventoryItem =
      await this.createInventoryEquipment(equipmentClass);
    return new MapItem({ coordinates, map, sprite, inventoryItem });
  };

  createEquipment = async (equipmentClass: string): Promise<Equipment> => {
    const model = await this.modelLoader.loadEquipmentModel(equipmentClass);
    const spriteName = model.sprite;
    const sprite = await this.spriteFactory.createEquipmentSprite(
      spriteName,
      PaletteSwaps.create(model.paletteSwaps)
    );

    // TODO wtf is this
    const inventoryItem = await this.createInventoryEquipment(equipmentClass);
    const equipment = new Equipment({ model, sprite, inventoryItem });
    sprite.bind(equipment);
    return equipment;
  };

  createInventoryItem = async (model: ConsumableItemModel): Promise<InventoryItem> => {
    switch (model.type) {
      case 'life_potion': {
        const amount = parseInt(model.params?.amount ?? '0');
        return this.createLifePotion(amount);
      }
      case 'mana_potion': {
        const amount = parseInt(model.params?.amount ?? '0');
        return this.createManaPotion(model.name, amount);
      }
      case 'key': {
        return this.createKey(model.name);
      }
      case 'scroll': {
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
      PaletteSwaps.create(model.paletteSwaps)
    );
    return new MapItem({ coordinates, map, sprite, inventoryItem });
  };
}
