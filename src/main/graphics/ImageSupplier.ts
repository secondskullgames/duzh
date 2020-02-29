import { loadImage, applyTransparentColor, replaceColors } from './ImageUtils';
import { chainPromises } from '../utils/PromiseUtils';
import { PaletteSwaps } from '../types/types';

type ImageDataFunc = (imageData: ImageData) => Promise<ImageData>;

class ImageSupplier {
  readonly _imageSupplier: () => Promise<ImageBitmap>;
  image: Promise<ImageBitmap> | null;

  /**
   * @param effects A list of custom transformations to be applied to the image, in order
   */
  constructor(filename: string, transparentColor: string, paletteSwaps: PaletteSwaps = {}, effects: ImageDataFunc[] = []) {
    this.image = null;
    this._imageSupplier = () => loadImage(filename)
      .then(imageData => applyTransparentColor(imageData, transparentColor))
      .then(imageData => replaceColors(imageData, paletteSwaps))
      // @ts-ignore
      .then(imageData => chainPromises(effects, imageData))
      .then(imageData => createImageBitmap(imageData));
  }

  get(): Promise<ImageBitmap> {
    if (!this.image) {
      this.image = this._imageSupplier();
    }
    return this.image;
  }
}

export default ImageSupplier;
