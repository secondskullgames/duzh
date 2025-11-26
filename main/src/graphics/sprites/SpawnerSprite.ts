import DynamicSprite from './DynamicSprite';
import Spawner from '../../objects/Spawner';
import { Offsets } from '@duzh/geometry';
import { Image } from '@duzh/graphics/images';

type Props = Readonly<{
  spriteName: string;
  offsets: Offsets;
  imageMap: Record<string, Image>;
}>;

export class SpawnerSprite extends DynamicSprite<Spawner> {
  constructor({ spriteName, offsets, imageMap }: Props) {
    super({ spriteName, offsets, imageMap });
  }

  protected getFrameKey = (target: Spawner): string => {
    return target.getState().toLowerCase();
  };
}
