import DynamicSprite from './DynamicSprite';
import { Image } from '@duzh/graphics/images';
import Shrine from '@main/objects/Shrine';

type Props = Readonly<{
  imageMap: Record<string, Image>;
}>;

export class ShrineSprite extends DynamicSprite<Shrine> {
  constructor({ imageMap }: Props) {
    super({
      spriteName: 'shrine',
      offsets: { dx: 0, dy: -24 },
      imageMap
    });
  }

  protected getFrameKey = (target: Shrine): string => {
    return target.isDepleted() ? 'shrine_depleted' : 'shrine';
  };
}
