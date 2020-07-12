import { loadImage, applyTransparentColor, replaceColors } from './ImageUtils';
import { chainPromises } from '../utils/PromiseUtils';
import { PaletteSwaps } from '../types/types';

type ImageDataFunc = (imageData: ImageData) => Promise<ImageData>;

class ImageSupplier {
  private readonly _image: Promise<ImageBitmap>;

  /**
   * @param effects A list of custom transformations to be applied to the image, in order
   */
  constructor(filename: string, transparentColor: string, paletteSwaps: PaletteSwaps = {}, effects: ImageDataFunc[] = []) {
    this._image = loadImage(filename)
      .then(imageData => applyTransparentColor(imageData, transparentColor))
      .then(imageData => replaceColors(imageData, paletteSwaps))
      // @ts-ignore
      .then(imageData => chainPromises(effects, imageData))
      .then(imageData => createImageBitmap(imageData));
  }

  get(): Promise<ImageBitmap> {
    return this._image;
  }
}

export default ImageSupplier;
