import DynamicSprite from './DynamicSprite';
import Offsets from '../../geometry/Offsets';
import { Image } from '../images/Image';
import Door from '../../entities/objects/Door';

type Props = Readonly<{
  offsets: Offsets;
  imageMap: Record<string, Image>;
}>;

export class DoorSprite extends DynamicSprite<Door> {
  constructor({ offsets, imageMap }: Props) {
    super({ offsets, imageMap });
  }

  protected getAnimationKey = (target: Door): string => {
    const direction = target.getDirection().toLowerCase();
    const state = target.getState().toLowerCase();
    return `${direction}_${state}`;
  };
}
