import { EquipmentSlot } from '../../gen-schema/equipment-slot.schema';
import { EquipmentModel } from '../../gen-schema/equipment.schema';
import Sprite from '../graphics/sprites/Sprite';
import Animatable from '../graphics/animations/Animatable';
import Direction from '../geometry/Direction';
import Unit from '../units/Unit';
import InventoryItem from '../items/InventoryItem';
import { checkNotNull } from '../utils/preconditions';
import EquipmentScript from './EquipmentScript';
import Activity from '../types/Activity';

const DRAW_BEHIND_PREFIX = '_B';

type Props = Readonly<{
  model: EquipmentModel,
  sprite: Sprite,
  inventoryItem?: InventoryItem | null
}>;

export default class Equipment implements Animatable {
  readonly inventoryItem: InventoryItem | null;
  readonly damage?: number; // typically only for weapons
  readonly absorbAmount?: number; // typically for armor
  readonly blockAmount?: number; // typically only for shields
  private readonly sprite: Sprite;
  readonly slot: EquipmentSlot;
  private readonly name: string;
  readonly script: EquipmentScript | null;
  private _unit: Unit | null;

  constructor({ model, sprite, inventoryItem }: Props) {
    this.name = model.name;
    this.slot = model.slot as EquipmentSlot;
    this.inventoryItem = inventoryItem ?? null;
    this.damage = model.stats.damage;
    this.absorbAmount = model.stats.absorbAmount ?? 0;
    this.blockAmount = model.stats.blockAmount ?? 0;
    this.sprite = sprite;
    this.script = (model.script) ? model.script as EquipmentScript : null;
    this._unit = null;
  }

  getName = () => this.name;

  attach = (unit: Unit) => { this._unit = unit; };

  getUnit = () => this._unit;

  /**
   * @override {@link Animatable#getAnimationKey}
   */
  getAnimationKey = () => {
    const unit = checkNotNull(this._unit);
    return `${Activity.toString(unit.getActivity())}_${Direction.toString(unit.getDirection())}_${unit.getFrameNumber()}`;
  };

  getSprite = () => this.sprite;

  drawBehind = async (): Promise<boolean> => {
    const image = await this.sprite.getImage();
    const drawBehind = (image?.filename?.endsWith(DRAW_BEHIND_PREFIX)) ?? false;
    return drawBehind;
  };
}
