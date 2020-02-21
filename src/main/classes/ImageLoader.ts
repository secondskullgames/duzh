import { loadImage, applyTransparentColor, replaceColors } from '../utils/ImageUtils';
import { chainPromises } from '../utils/PromiseUtils';
import { PaletteSwaps } from '../types';

type ImageDataFunc = (imageData: ImageData) => Promise<ImageData>;

class ImageLoader {
  readonly _imageSupplier: () => Promise<ImageBitmap>;
  image: Promise<ImageBitmap> | null;

  constructor(filename, transparentColor: string, paletteSwaps: PaletteSwaps = {}, effects: ImageDataFunc[] = []) {
    this.image = null;
    this.image = null;
    this._imageSupplier = () => loadImage(filename)
      .then(imageData => applyTransparentColor(imageData, transparentColor))
      .then(imageData => replaceColors(imageData, paletteSwaps))
      .then(imageData => chainPromises(effects, imageData))
      .then(imageData => createImageBitmap(imageData));
  }

  load(): void {
    if (!this.image) {
      this.image = this._imageSupplier();
    }
  }
}

export default ImageLoader;
