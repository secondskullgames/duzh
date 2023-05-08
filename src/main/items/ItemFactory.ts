import GameState from '../core/GameState';
import PaletteSwaps from '../graphics/PaletteSwaps';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import Coordinates from '../geometry/Coordinates';
import Unit from '../entities/units/Unit';
import Equipment from '../equipment/Equipment';
import { loadEquipmentModel, loadItemModel } from '../utils/models';
import InventoryItem from './InventoryItem';
import MapItem from '../entities/objects/MapItem';
import ConsumableItemModel from '../schemas/ConsumableItemModel';
import EquipmentModel from '../schemas/EquipmentModel';
import { checkNotNull } from '../utils/preconditions';
import AnimationFactory from '../graphics/animations/AnimationFactory';
import { playAnimation } from '../graphics/animations/playAnimation';
import GameRenderer from '../graphics/renderers/GameRenderer';
import { logMessage } from '../actions/logMessage';
import { dealDamage } from '../actions/dealDamage';
import { equipItem } from '../actions/equipItem';
import ImageFactory from '../graphics/images/ImageFactory';

type ItemProc = (item: InventoryItem, unit: Unit) => Promise<void>;

type Props = Readonly<{
  state: GameState,
  animationFactory: AnimationFactory
}>;

export default class ItemFactory {
  private readonly state: GameState;
  private readonly animationFactory: AnimationFactory;

  constructor({ state, animationFactory }: Props) {
    this.state = state;
    this.animationFactory = animationFactory;
  }

  createLifePotion = (lifeRestored: number): InventoryItem => {
    const onUse: ItemProc = async (item: InventoryItem, unit: Unit) => {
      playSound(Sounds.USE_POTION);
      const lifeGained = unit.gainLife(lifeRestored);
      logMessage(
        `${unit.getName()} used ${item.name} and gained ${lifeGained} life.`,
        { state: this.state }
      );
    };

    return new InventoryItem({
      name: 'Life Potion',
      category: 'POTION',
      onUse
    });
  };

  createManaPotion = (manaRestored: number): InventoryItem => {
    const onUse: ItemProc = async (item: InventoryItem, unit: Unit) => {
      playSound(Sounds.USE_POTION);
      const manaGained = unit.gainMana(manaRestored);
      logMessage(
        `${unit.getName()} used ${item.name} and gained ${manaGained} mana.`,
        { state: this.state }
      );
    };

    return new InventoryItem({
      name: 'Mana Potion',
      category: 'POTION',
      onUse
    });
  };

  createKey = (): InventoryItem => {
    const onUse: ItemProc = async () => {}; // TODO - for now just use these by walking into a door

    return new InventoryItem({
      name: 'Key',
      category: 'KEY',
      onUse
    });
  };

  createScrollOfFloorFire = async (damage: number): Promise<InventoryItem> => {
    const onUse: ItemProc = async (item, unit): Promise<void> => {
      const { state } = this;
      const map = state.getMap();

      const adjacentUnits: Unit[] = map.getAllUnits()
        .filter(u => {
          const { dx, dy } = Coordinates.difference(unit.getCoordinates(), u.getCoordinates());
          return ([-1,0,1].includes(dx))
            && ([-1,0,1].includes(dy))
            && !(dx === 0 && dy === 0);
        });

      playSound(Sounds.PLAYER_HITS_ENEMY);
      const animation = await this.animationFactory.getFloorFireAnimation(unit, adjacentUnits);
      await playAnimation(animation, {
        state: this.state,
        renderer: GameRenderer.getInstance()
      });

      for (const adjacentUnit of adjacentUnits) {
        await dealDamage(damage, {
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

  createMapEquipment = async (equipmentClass: string, { x, y }: Coordinates): Promise<MapItem> => {
    const model = await loadEquipmentModel(equipmentClass);
    const sprite = await SpriteFactory.createStaticSprite(
      model.mapIcon,
      PaletteSwaps.create(model.paletteSwaps),
      { imageFactory: ImageFactory.getInstance()
    });
    const inventoryItem: InventoryItem = await this._createInventoryWeapon(equipmentClass);
    return new MapItem({ x, y, sprite, inventoryItem });
  };

  private _createInventoryWeapon = async (equipmentClass: string): Promise<InventoryItem> => {
    const onUse: ItemProc = async (item: InventoryItem, unit: Unit) => {
      const equipment = await this.createEquipment(equipmentClass);
      return equipItem(item, equipment, unit, { state: this.state });
    };
    const model = await loadEquipmentModel(equipmentClass);
    return new InventoryItem({
      name: model.name,
      category: model.itemCategory,
      onUse
    });
  };

  createEquipment = async (equipmentClass: string): Promise<Equipment> => {
    const model = await loadEquipmentModel(equipmentClass);
    const spriteName = model.sprite;
    const sprite = await SpriteFactory.createEquipmentSprite(
      spriteName,
      PaletteSwaps.create(model.paletteSwaps),
      { imageFactory: ImageFactory.getInstance() }
    );
    const inventoryItem = (model.itemCategory === 'WEAPON')
      ? await this._createInventoryWeapon(equipmentClass)
      : null;
    const equipment = new Equipment({ model, sprite, inventoryItem });
    sprite.target = equipment;
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
        return this.createManaPotion(amount);
      }
      case 'key': {
        return this.createKey();
      }
      case 'scroll': {
        const spell = model.params?.spell;
        switch (spell) {
          case 'floor_fire':
            const damage = parseInt(model.params?.damage ?? '0');
            return this.createScrollOfFloorFire(damage);
          default:
            throw new Error(`Unknown spell: ${JSON.stringify(spell)}`);
        }
      }
      default:
        throw new Error(`Invalid item definition: ${JSON.stringify(model)}`);
    }
  }

  createMapItem = async (itemId: string, { x, y }: Coordinates) => {
    const model: ConsumableItemModel = await loadItemModel(itemId);
    const inventoryItem = await this.createInventoryItem(model);
    const sprite = await SpriteFactory.createStaticSprite(
      model.mapSprite,
      PaletteSwaps.create(model.paletteSwaps),
      { imageFactory: ImageFactory.getInstance() }
    );
    return new MapItem({ x, y, sprite, inventoryItem });
  };

  loadAllConsumableModels = async (): Promise<ConsumableItemModel[]> => {
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

  loadAllEquipmentModels = async (): Promise<EquipmentModel[]> => {
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

  private static instance: ItemFactory | null;
  static getInstance = (): ItemFactory => checkNotNull(ItemFactory.instance);
  static setInstance = (instance: ItemFactory) => { ItemFactory.instance = instance; };
}