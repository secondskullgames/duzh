
import { loadImage, applyTransparentColor, replaceColors } from '../utils/ImageUtils';

class Sprite {
  loading: boolean;
  image: ImageBitmap | null;
  dx: number;
  dy: number;
  private readonly _imagePromise: Promise<void>;
  /**
   * @param {!string} filename
   * @param {!int} dx
   * @param {!int} dy
   * @param {!string} transparentColor in hex format, e.g. #ffffff
   * @param {Object<string,string> | undefined} paletteSwaps (hex => hex)
   * @constructor
   */
  constructor(filename, { dx, dy }, transparentColor, paletteSwaps = {}) {
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
