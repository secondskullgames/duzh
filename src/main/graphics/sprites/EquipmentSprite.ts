import DynamicSprite from './DynamicSprite';
import Equipment from '../../equipment/Equipment';
import Activity from '../../entities/units/Activity';
import { Direction } from '@lib/geometry/Direction';
import { Offsets } from '@lib/geometry/Offsets';
import { checkNotNull } from '@lib/utils/preconditions';
import Unit from '@main/entities/units/Unit';
import { UnitEffect } from '@main/entities/units/effects/UnitEffect';
import { maxBy } from '@lib/utils/arrays';
import { Image } from '@lib/graphics/images/Image';

type Props = Readonly<{
  spriteName: string;
  offsets: Offsets;
  imageMap: Record<string, Image>;
}>;

export class EquipmentSprite extends DynamicSprite<Equipment> {
  constructor({ spriteName, offsets, imageMap }: Props) {
    super({ spriteName, offsets, imageMap });
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
      // super hack to make Damaged take precedence over Stunned
      return maxBy(effects, effect => (effect === UnitEffect.STUNNED ? 0 : 1));
    }
    return null;
  };
}
