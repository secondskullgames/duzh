
import { loadImage, applyTransparentColor, replaceColors } from '../utils/ImageUtils';
import { PaletteSwaps } from '../types';

class Sprite {
  readonly dx: number;
  readonly dy: number;

  image: Promise<ImageBitmap> | null;

  constructor(filename, { dx, dy }, transparentColor: string, paletteSwaps: PaletteSwaps = {}) {
    this.image = null;
    this.dx = dx;
    this.dy = dy;

    this.image = loadImage(filename)
      .then(imageData => applyTransparentColor(imageData, transparentColor))
      .then(imageData => replaceColors(imageData, paletteSwaps))
      .then(imageData => createImageBitmap(imageData));
  }
}

export default Sprite;
