import Sprite from './Sprite';
import { PaletteSwaps } from '../../types/types';
import ImageSupplier from '../ImageSupplier';
import Colors from '../../types/Colors';
import { StaticSpriteConfig } from './StaticSpriteConfig';

class StaticSprite extends Sprite {
  private readonly _image: ImageSupplier;

  constructor(spriteConfig: StaticSpriteConfig, paletteSwaps?: PaletteSwaps) {
    super(spriteConfig.offsets);
    this._image = new ImageSupplier(spriteConfig.filename, Colors.WHITE, paletteSwaps);
  }

  /**
   * @override {@link Sprite#getImage}
   */
  getImage(): Promise<ImageBitmap> {
    return this._image.get();
  }
}

export default StaticSprite;