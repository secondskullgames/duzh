import { DynamicSprite } from './DynamicSprite';
import { Image } from '../images/Image';
import Activity from '../../entities/units/Activity';
import Unit from '../../entities/units/Unit';
import { Offsets, Direction } from '@main/geometry';

type Props = Readonly<{
  offsets: Offsets;
  imageMap: Record<string, Image>;
}>;

export class UnitSprite extends DynamicSprite<Unit> {
  constructor({ offsets, imageMap }: Props) {
    super({ offsets, imageMap });
  }

  protected getAnimationKey = (target: Unit): string => {
    const activity = Activity.toString(target.getActivity());
    const direction = Direction.toString(target.getDirection());
    const frameNumber = target.getFrameNumber();
    return `${activity}_${direction}_${frameNumber}`;
  };
}
