import { EquipmentScriptName } from './EquipmentScript';
import { getEquipmentTooltip } from './getEquipmentTooltip';
import Sprite from '../graphics/sprites/Sprite';
import Animatable from '../graphics/animations/Animatable';
import Direction from '../geometry/Direction';
import Unit from '../entities/units/Unit';
import InventoryItem from '../items/InventoryItem';
import { checkNotNull } from '../utils/preconditions';
import Activity from '../entities/units/Activity';
import EquipmentModel from '../schemas/EquipmentModel';
import EquipmentSlot from '../schemas/EquipmentSlot';

const DRAW_BEHIND_PREFIX = '_B';

type Props = Readonly<{
  model: EquipmentModel;
  sprite: Sprite;
  inventoryItem?: InventoryItem | null;
}>;

export default class Equipment implements Animatable {
  readonly inventoryItem: InventoryItem | null;
  readonly damage?: number; // typically only for weapons
  readonly absorbAmount?: number; // typically for armor
  readonly blockAmount?: number; // typically only for shields
  private readonly sprite: Sprite;
  readonly slot: EquipmentSlot;
  private readonly name: string;
  readonly script: EquipmentScriptName | null;
  private _unit: Unit | null;
  private readonly tooltip: string;

  constructor({ model, sprite, inventoryItem }: Props) {
    this.name = model.name;
    this.slot = model.slot as EquipmentSlot;
    this.inventoryItem = inventoryItem ?? null;
    this.damage = model.stats.damage;
    this.absorbAmount = model.stats.absorbAmount ?? 0;
    this.blockAmount = model.stats.blockAmount ?? 0;
    this.sprite = sprite;
    this.script = model.script ? (model.script as EquipmentScriptName) : null;
    this.tooltip = getEquipmentTooltip(model);
    this._unit = null;
  }

  getName = () => this.name;

  attach = (unit: Unit) => {
    this._unit = unit;
  };

  getUnit = () => this._unit;

  /**
   * @override {@link Animatable#getAnimationKey}
   */
  getAnimationKey = () => {
    const unit = checkNotNull(this._unit);
    return `${Activity.toString(unit.getActivity())}_${Direction.toString(
      unit.getDirection()
    )}_${unit.getFrameNumber()}`;
  };

  getSprite = (): Sprite => this.sprite;

  drawBehind = (): boolean => {
    const image = this.sprite.getImage();
    return image?.filename?.endsWith(DRAW_BEHIND_PREFIX) ?? false;
  };

  getTooltip = (): string => this.tooltip;
}
