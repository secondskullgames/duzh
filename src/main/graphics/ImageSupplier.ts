import { loadImage, applyTransparentColor, replaceColors } from './ImageUtils';
import { chainPromises } from '../utils/PromiseUtils';
import { PaletteSwaps } from '../types/types';

type ImageDataFunc = (imageData: ImageData) => Promise<ImageData>;

class ImageSupplier {
  private readonly _image: Promise<ImageBitmap>;

  /**
   * @param effects A list of custom transformations to be applied to the image, in order
   */
  constructor(filename: string | string[], transparentColor: string, paletteSwaps: PaletteSwaps = {}, effects: ImageDataFunc[] = []) {
    const filenames = (Array.isArray(filename) ? filename : [filename]);
    this._image = this._loadFirst(filenames)
      .then(imageData => applyTransparentColor(imageData, transparentColor))
      .then(imageData => replaceColors(imageData, paletteSwaps))
      // @ts-ignore
      .then(imageData => chainPromises(effects, imageData))
      .then(imageData => createImageBitmap(imageData));
  }

  get(): Promise<ImageBitmap> {
    return this._image;
  }

  private _loadFirst(filenames: string[]): Promise<ImageData> {
    const promises: Promise<ImageData | null>[] = filenames.map(filename => this._loadOptional(filename));
    return Promise.all(promises)
      .then(results => {
        const imageData = results.filter(p => !!p)[0];
        if (!imageData) {
          throw `Failed to load images: ${filenames}`;
        }
        return imageData;
      });
  }

  private _loadOptional(filename: string): Promise<ImageData | null> {
    return loadImage(filename)
      .catch(e => null);
  }
}

export default ImageSupplier;
