import { DynamicSprite } from './DynamicSprite';
import { Image } from '../images/Image';
import Door from '../../entities/objects/Door';
import { Offsets } from '@main/geometry';

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
