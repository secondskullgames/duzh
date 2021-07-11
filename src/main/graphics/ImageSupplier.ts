import PaletteSwaps from '../types/PaletteSwaps';
import { applyTransparentColor, replaceColors } from './ImageUtils';
import ImageLoader from './ImageLoader';

type ImageDataFunc = (imageData: ImageData) => Promise<ImageData>;

class ImageSupplier {
  private readonly _image: Promise<ImageBitmap>;

  /**
   * @param effects A list of custom transformations to be applied to the image, in order
   */
  constructor(filename: string | string[], transparentColor: string, paletteSwaps: PaletteSwaps = {}, effects: ImageDataFunc[] = []) {
    const filenames = (Array.isArray(filename) ? filename : [filename]);
    this._image = this._load(filenames, paletteSwaps, transparentColor, effects);
  }

  get(): Promise<ImageBitmap> {
    return this._image;
  }

  private async _load(filenames: string[], paletteSwaps: PaletteSwaps, transparentColor: string, effects: ImageDataFunc[]): Promise<ImageBitmap> {
    let imageData = await this._loadFirst(filenames)
      .then(imageData => applyTransparentColor(imageData, transparentColor))
      .then(imageData => replaceColors(imageData, paletteSwaps));

    for (const effect of effects) {
      imageData = await effect(imageData);
    }
    return createImageBitmap(imageData);
  }

  private async _loadFirst(filenames: string[]): Promise<ImageData> {
    const promises: Promise<ImageData | null>[] = filenames.map(filename => this._loadOptional(filename));
    const results = await Promise.all(promises);
    const imageData = results.filter(p => !!p)[0];
    if (!imageData) {
      throw `Failed to load images: ${filenames}`;
    }
    return imageData;
  }

  private async _loadOptional(filename: string): Promise<ImageData | null> {
    return ImageLoader.loadImage(filename)
      .catch(e => null);
  }
}

export default ImageSupplier;
