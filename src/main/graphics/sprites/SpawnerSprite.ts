import DynamicSprite from './DynamicSprite';
import { Image } from '../images/Image';
import Spawner from '../../entities/objects/Spawner';
import { Offsets } from '@main/geometry';

type Props = Readonly<{
  offsets: Offsets;
  imageMap: Record<string, Image>;
}>;

export class SpawnerSprite extends DynamicSprite<Spawner> {
  constructor({ offsets, imageMap }: Props) {
    super({ offsets, imageMap });
  }

  protected getAnimationKey = (target: Spawner): string => {
    return target.getState().toLowerCase();
  };
}
