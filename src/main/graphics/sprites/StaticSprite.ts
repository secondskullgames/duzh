import Sprite, { Offsets } from './Sprite';
import { PaletteSwaps } from '../../types/types';
import ImageSupplier from '../ImageSupplier';
import Colors from '../../types/Colors';

class StaticSprite extends Sprite {
  private readonly _image: ImageSupplier;

  constructor(
    filename: string,
    offsets: Offsets,
    paletteSwaps?: PaletteSwaps
  ) {
    super(offsets);
    this._image = new ImageSupplier(filename, Colors.WHITE, paletteSwaps);
  }

  /**
   * @override {@link Sprite#getImage}
   */
  getImage(): Promise<ImageBitmap> {
    return this._image.get();
  }
}

export default StaticSprite;