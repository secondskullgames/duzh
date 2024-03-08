import DynamicSprite from './DynamicSprite';
import Spawner from '../../entities/objects/Spawner';
import Offsets from '@lib/geometry/Offsets';
import { Image } from '@lib/graphics/images/Image';

type Props = Readonly<{
  offsets: Offsets;
  imageMap: Record<string, Image>;
}>;

export class SpawnerSprite extends DynamicSprite<Spawner> {
  constructor({ offsets, imageMap }: Props) {
    super({ offsets, imageMap });
  }

  protected getFrameKey = (target: Spawner): string => {
    return target.getState().toLowerCase();
  };
}
