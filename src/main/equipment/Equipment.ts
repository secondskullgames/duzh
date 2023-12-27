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
import { AbilityName } from '../entities/units/abilities/AbilityName';

const DRAW_BEHIND_PREFIX = '_B';

type Props = Readonly<{
  model: EquipmentModel;
  sprite: Sprite | null;
  inventoryItem?: InventoryItem | null;
}>;

export default class Equipment implements Animatable {
  readonly inventoryItem: InventoryItem | null;
  readonly damage?: number; // typically only for weapons
  readonly absorbAmount?: number; // typically for armor
  readonly blockAmount?: number; // typically only for shields
  private readonly sprite: Sprite | null;
  readonly slot: EquipmentSlot;
  private readonly id: string;
  private readonly name: string;
  readonly script: EquipmentScriptName | null;
  private unit: Unit | null;
  private readonly tooltip: string;
  private readonly abilityName: AbilityName | null;

  constructor({ model, sprite, inventoryItem }: Props) {
    this.id = model.id;
    this.name = model.name;
    this.slot = model.slot as EquipmentSlot;
    this.inventoryItem = inventoryItem ?? null;
    this.damage = model.stats.damage;
    this.absorbAmount = model.stats.absorbAmount ?? 0;
    this.blockAmount = model.stats.blockAmount ?? 0;
    this.sprite = sprite;
    this.script = model.script ? (model.script as EquipmentScriptName) : null;
    this.tooltip = getEquipmentTooltip(model);
    this.abilityName = model.abilityName ? (model.abilityName as AbilityName) : null;
    this.unit = null;
  }

  getId = () => this.id;

  getName = () => this.name;

  attach = (unit: Unit) => {
    this.unit = unit;
  };

  unattach = () => {
    this.unit = null;
  };

  getUnit = () => this.unit;

  /**
   * @override {@link Animatable#getAnimationKey}
   */
  getAnimationKey = () => {
    const unit = checkNotNull(this.unit);
    const activity = Activity.toString(unit.getActivity());
    const direction = Direction.toString(unit.getDirection());
    const frameNumber = unit.getFrameNumber();
    return `${activity}_${direction}_${frameNumber}`;
  };

  getSprite = (): Sprite | null => this.sprite;

  drawBehind = (): boolean => {
    if (!this.sprite) {
      return false;
    }
    const image = this.sprite.getImage();
    return image?.filename?.endsWith(DRAW_BEHIND_PREFIX) ?? false;
  };

  getTooltip = (): string => this.tooltip;

  getAbilityName = (): AbilityName | null => this.abilityName;
}
