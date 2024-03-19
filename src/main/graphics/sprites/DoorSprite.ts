import DynamicSprite from './DynamicSprite';
import Door from '../../objects/Door';
import { Offsets } from '@lib/geometry/Offsets';
import { Image } from '@lib/graphics/images/Image';

type Props = Readonly<{
  spriteName: string;
  offsets: Offsets;
  imageMap: Record<string, Image>;
}>;

export class DoorSprite extends DynamicSprite<Door> {
  constructor({ spriteName, offsets, imageMap }: Props) {
    super({ spriteName, offsets, imageMap });
  }

  protected getFrameKey = (target: Door): string => {
    const direction = target.getDirection().toLowerCase();
    const state = target.getState().toLowerCase();
    return `${direction}_${state}`;
  };
}
