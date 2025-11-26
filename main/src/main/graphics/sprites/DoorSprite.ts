import DynamicSprite from './DynamicSprite';
import Door from '../../objects/Door';
import { Offsets } from '@duzh/geometry';
import { Image } from '@duzh/graphics/images';

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
