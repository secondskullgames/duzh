import Sprite from '../graphics/sprites/Sprite';
import Animatable from '../types/Animatable';
import Direction from '../geometry/Direction';
import Unit from '../units/Unit';
import InventoryItem from '../items/InventoryItem';
import { checkNotNull } from '../utils/preconditions';
import EquipmentModel from './EquipmentModel';
import EquipmentSlot from './EquipmentSlot';

type Props = {
  model: EquipmentModel,
  sprite: Sprite,
  inventoryItem?: InventoryItem
};

class Equipment implements Animatable {
  readonly inventoryItem: InventoryItem | null;
  readonly damage?: number; // typically only for weapons
  readonly blockAmount: number; // typically only for shields
  readonly sprite: Sprite;
  readonly slot: EquipmentSlot;
  readonly name: string;
  private _unit: Unit | null;

  constructor({ model, sprite, inventoryItem }: Props) {
    this.name = model.name;
    this.slot = model.slot;
    this.inventoryItem = inventoryItem || null;
    this.damage = model.damage;
    this.blockAmount = model.blockAmount || 0;
    this.sprite = sprite;
    this._unit = null;
  }

  attach = (unit: Unit) => { this._unit = unit; };

  getUnit = () => this._unit;

  /**
   * @override {@link Animatable#getAnimationKey}
   */
  getAnimationKey = () => {
    const unit = checkNotNull(this._unit);
    return `${unit.activity.toLowerCase()}_${Direction.toString(unit.direction)}_${unit.frameNumber}`;
  };
}

export default Equipment;
