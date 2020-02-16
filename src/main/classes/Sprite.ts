
import { loadImage, applyTransparentColor, replaceColors } from '../utils/ImageUtils';
import { PaletteSwaps } from '../types';

class Sprite {
  loading: boolean;
  image: ImageBitmap | null;
  dx: number;
  dy: number;
  private readonly _imagePromise: Promise<void>;

  constructor(filename, { dx, dy }, transparentColor: string, paletteSwaps: PaletteSwaps = {}) {
    this.loading = false;
    this.image = null;
    this.dx = dx;
    this.dy = dy;

    this._imagePromise = loadImage(filename)
      .then(imageData => applyTransparentColor(imageData, transparentColor))
      .then(imageData => replaceColors(imageData, paletteSwaps))
      .then(imageData => createImageBitmap(imageData))
      .then(imageBitmap => { this.image = imageBitmap; });
  }

  whenReady(): Promise<void> {
    return this._imagePromise;
  }
}

export default Sprite;
