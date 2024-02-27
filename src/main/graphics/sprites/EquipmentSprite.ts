import DynamicSprite from './DynamicSprite';
import Offsets from '../../geometry/Offsets';
import { Image } from '../images/Image';
import Equipment from '../../equipment/Equipment';
import Activity from '../../entities/units/Activity';
import Direction from '../../geometry/Direction';
import { checkNotNull } from '@main/utils/preconditions';

type Props = Readonly<{
  offsets: Offsets;
  imageMap: Record<string, Image>;
}>;

export class EquipmentSprite extends DynamicSprite<Equipment> {
  constructor({ offsets, imageMap }: Props) {
    super({ offsets, imageMap });
  }

  protected getAnimationKey = (target: Equipment): string => {
    const unit = checkNotNull(target.getUnit());
    const activity = Activity.toString(unit.getActivity());
    const direction = Direction.toString(unit.getDirection());
    const frameNumber = unit.getFrameNumber();
    return `${activity}_${direction}_${frameNumber}`;
  };
}
