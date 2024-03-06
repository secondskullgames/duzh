import DynamicSprite from './DynamicSprite';
import Offsets from '../../geometry/Offsets';
import { Image } from '../images/Image';
import Activity from '../../entities/units/Activity';
import Direction from '../../geometry/Direction';
import Unit from '../../entities/units/Unit';
import { UnitEffect } from '@main/entities/units/effects/UnitEffect';

type Props = Readonly<{
  offsets: Offsets;
  imageMap: Record<string, Image>;
}>;

export class UnitSprite extends DynamicSprite<Unit> {
  constructor({ offsets, imageMap }: Props) {
    super({ offsets, imageMap });
  }

  protected getFrameKey = (target: Unit): string => {
    const animationName = (() => {
      const effect = this._getEffect(target);
      if (effect) {
        return effect.toLowerCase();
      } else {
        return Activity.toString(target.getActivity());
      }
    })();
    const direction = Direction.toString(target.getDirection());
    const frameNumber = target.getFrameNumber();
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
