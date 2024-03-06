import DynamicSprite from './DynamicSprite';
import Offsets from '../../geometry/Offsets';
import { Image } from '../images/Image';
import Equipment from '../../equipment/Equipment';
import Activity from '../../entities/units/Activity';
import Direction from '../../geometry/Direction';
import { checkNotNull } from '@main/utils/preconditions';
import Unit from '@main/entities/units/Unit';
import { UnitEffect } from '@main/entities/units/effects/UnitEffect';

type Props = Readonly<{
  offsets: Offsets;
  imageMap: Record<string, Image>;
}>;

export class EquipmentSprite extends DynamicSprite<Equipment> {
  constructor({ offsets, imageMap }: Props) {
    super({ offsets, imageMap });
  }

  /**
   * Copy-pasted from UnitSprite
   */
  protected getFrameKey = (target: Equipment): string => {
    const unit = checkNotNull(target.getUnit());
    const animationName = (() => {
      const effect = this._getEffect(unit);
      if (effect) {
        return effect.toLowerCase();
      } else {
        return Activity.toString(unit.getActivity());
      }
    })();
    const direction = Direction.toString(unit.getDirection());
    const frameNumber = unit.getFrameNumber();
    return `${animationName}_${direction}_${frameNumber}`;
  };

  private _getEffect = (target: Unit): UnitEffect | null => {
    const effects = target.getEffects().getEffects();
    if (effects.length > 0) {
      // TODO precedence
      return effects[0];
    }
    return null;
  };
}
