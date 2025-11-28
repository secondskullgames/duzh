import { Offsets } from '@duzh/geometry';
import { Image } from '@duzh/graphics/images';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import { Activity } from '../../units/Activity';
import Unit from '../../units/Unit';
import DynamicSprite from './DynamicSprite';

type Props = Readonly<{
  spriteName: string;
  offsets: Offsets;
  imageMap: Record<string, Image>;
}>;

export class UnitSprite extends DynamicSprite<Unit> {
  constructor({ spriteName, offsets, imageMap }: Props) {
    super({ spriteName, offsets, imageMap });
  }

  protected getFrameKey = (target: Unit): string => {
    const animationName = (() => {
      const effect = this._getEffect(target);
      if (effect) {
        return StatusEffect.toString(effect);
      } else {
        return Activity.toString(target.getActivity());
      }
    })();
    const direction = target.getDirection();
    const frameNumber = target.getFrameNumber();
    return `${animationName}_${direction}_${frameNumber}`;
  };

  private _getEffect = (target: Unit): StatusEffect | null => {
    const effects = target.getEffects().getEffects();
    // main thing is to put DAMAGED at the top, others don't matter much
    const precedence = [
      StatusEffect.DAMAGED,
      StatusEffect.BURNING,
      StatusEffect.FROZEN,
      StatusEffect.SHOCKED,
      StatusEffect.OVERDRIVE
    ];
    for (const effect of precedence) {
      if (effects.includes(effect)) {
        return effect;
      }
    }
    return null;
  };
}
