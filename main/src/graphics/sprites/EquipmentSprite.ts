import { Offsets } from '@duzh/geometry';
import { Image } from '@duzh/graphics/images';
import { checkNotNull } from '@duzh/utils/preconditions';
import Unit from '@main/units/Unit';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import Equipment from '../../equipment/Equipment';
import { Activity } from '../../units/Activity';
import DynamicSprite from './DynamicSprite';

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
    const direction = unit.getDirection();
    const frameNumber = unit.getFrameNumber();
    return `${animationName}_${direction}_${frameNumber}`;
  };

  private _getEffect = (target: Unit): StatusEffect | null => {
    const effects = target.getEffects().getEffects();
    if (effects.length > 0) {
      if (effects.includes(StatusEffect.DAMAGED)) {
        return StatusEffect.DAMAGED;
      }
      for (const effect of effects) {
        if (effect !== StatusEffect.OVERDRIVE) {
          return effect;
        }
      }
    }
    return null;
  };
}
