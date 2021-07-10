import PaletteSwaps from '../../types/PaletteSwaps';
import Sprite from './Sprite';
import ImageSupplier from '../ImageSupplier';
import Color from '../../types/Color';
import StaticSpriteConfig from './StaticSpriteConfig';

class StaticSprite extends Sprite {
  private readonly _image: ImageSupplier;

  constructor(spriteConfig: StaticSpriteConfig, paletteSwaps?: PaletteSwaps) {
    super(spriteConfig.offsets);
    this._image = new ImageSupplier(spriteConfig.filename, Color.WHITE, paletteSwaps);
  }

  /**
   * @override {@link Sprite#getImage}
   */
  getImage(): Promise<ImageBitmap> {
    return this._image.get();
  }
}

export default StaticSprite;
