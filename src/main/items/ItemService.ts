import { GameEngine } from '../core/GameEngine';
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
import UnitService from '../entities/units/UnitService';

type ItemProc = (item: InventoryItem, unit: Unit) => Promise<void>;

type Props = Readonly<{
  state: GameState,
  engine: GameEngine,
  spriteFactory: SpriteFactory,
  animationFactory: AnimationFactory
}>;

export default class ItemService {
  private readonly state: GameState;
  private readonly engine: GameEngine;
  private readonly spriteFactory: SpriteFactory;
  private readonly animationFactory: AnimationFactory;

  constructor({ state, engine, spriteFactory, animationFactory }: Props) {
    this.state = state;
    this.engine = engine;
    this.spriteFactory = spriteFactory;
    this.animationFactory = animationFactory;
  }

  createLifePotion = (lifeRestored: number): InventoryItem => {
    const onUse: ItemProc = async (item: InventoryItem, unit: Unit) => {
      playSound(Sounds.USE_POTION);
      const lifeGained = unit.gainLife(lifeRestored);
      this.state.logMessage(`${unit.getName()} used ${item.name} and gained ${lifeGained} life.`);
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
      this.state.logMessage(`${unit.getName()} used ${item.name} and gained ${manaGained} mana.`);
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
      const { state, engine } = this;
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
      await engine.playAnimation(animation);

      for (const adjacentUnit of adjacentUnits) {
        await UnitService.getInstance().dealDamage(damage, {
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
    const sprite = await this.spriteFactory.createStaticSprite(model.mapIcon, PaletteSwaps.create(model.paletteSwaps));
    const inventoryItem: InventoryItem = await this._createInventoryWeapon(equipmentClass);
    return new MapItem({ x, y, sprite, inventoryItem });
  };

  private _createInventoryWeapon = async (equipmentClass: string): Promise<InventoryItem> => {
    const onUse: ItemProc = async (item: InventoryItem, unit: Unit) => {
      const equipment = await this.createEquipment(equipmentClass);
      return this.equipItem(item, equipment, unit);
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
    const sprite = await this.spriteFactory.createEquipmentSprite(spriteName, PaletteSwaps.create(model.paletteSwaps));
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
    const paletteSwaps = (model.paletteSwaps !== undefined)
      ? PaletteSwaps.create(model.paletteSwaps)
      : undefined;
    const sprite = await this.spriteFactory.createStaticSprite(model.mapSprite, paletteSwaps);
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

  pickupItem = (unit: Unit, mapItem: MapItem) => {
    const { inventoryItem } = mapItem;
    unit.getInventory().add(inventoryItem);
    this.state.logMessage(`Picked up a ${inventoryItem.name}.`);
    playSound(Sounds.PICK_UP_ITEM);
  };

  useItem = async (unit: Unit, item: InventoryItem) => {
    await item.use(unit);
    unit.getInventory().remove(item);
  };

  equipItem = async (item: InventoryItem, equipment: Equipment, unit: Unit) => {
    const currentEquipment = unit.getEquipment().getBySlot(equipment.slot);
    if (currentEquipment) {
      const inventoryItem = currentEquipment.inventoryItem;
      if (inventoryItem) {
        unit.getInventory().add(inventoryItem);
      }
    }
    unit.getEquipment().add(equipment);
    equipment.attach(unit);
    this.state.logMessage(`Equipped ${equipment.getName()}.`);
    playSound(Sounds.BLOCKED);
  };

  private static instance: ItemService | null;
  static getInstance = (): ItemService => checkNotNull(ItemService.instance);
  static setInstance = (instance: ItemService) => { ItemService.instance = instance; };
}