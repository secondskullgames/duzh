import DynamicSprite from './DynamicSprite';
import Door from '../../entities/objects/Door';
import Offsets from '@lib/geometry/Offsets';
import { Image } from '@lib/graphics/images/Image';

type Props = Readonly<{
  offsets: Offsets;
  imageMap: Record<string, Image>;
}>;

export class DoorSprite extends DynamicSprite<Door> {
  constructor({ offsets, imageMap }: Props) {
    super({ offsets, imageMap });
  }

  protected getFrameKey = (target: Door): string => {
    const direction = target.getDirection().toLowerCase();
    const state = target.getState().toLowerCase();
    return `${direction}_${state}`;
  };
}
