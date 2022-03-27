import Color from '../Color';
import PaletteSwaps from '../PaletteSwaps';
import Image from './Image';
import ImageLoader from './ImageLoader';
import { applyTransparentColor, replaceColors } from './ImageUtils';

type ImageDataFunc = (imageData: ImageData) => Promise<ImageData>;

const _loadOptional = async (filename: string): Promise<ImageData | null> => {
  return ImageLoader.loadImage(filename)
    .catch(e => null);
};

type Props = {
  filename?: string,
  filenames?: string[]
  transparentColor: Color,
  paletteSwaps?: PaletteSwaps,
  effects?: ImageDataFunc[]
};

class ImageBuilder {
  private readonly _props: Props;
  /**
   * @param effects A list of custom transformations to be applied to the image, in order
   */
  constructor(props: Props) {
    this._props = props;
  }

  build = async (): Promise<Image> => {
    const { filename, transparentColor, paletteSwaps, effects } = this._props;
    let filenames: string[];
    if (this._props.filenames) {
      filenames = this._props.filenames;
    } else if (filename) {
      filenames = [filename];
    } else {
      throw new Error('No filenames were specified!');
    }

    const imageDatas: (ImageData | null)[] = await Promise.all(filenames.map(_loadOptional));
    for (let i = 0; i < filenames.length; i++) {
      const filename = filenames[i];
      let imageData = imageDatas[i];
      if (imageData) {
        imageData = await applyTransparentColor(imageData, transparentColor);
        imageData = await replaceColors(imageData, (paletteSwaps || PaletteSwaps.empty()));

        for (const effect of (effects || [])) {
          imageData = await effect(imageData);
        }

        return {
          bitmap: await createImageBitmap(imageData),
          filename
        };
      }
    }

    throw new Error(`Failed to load images: ${JSON.stringify(filenames)}`);
  };
}

export default ImageBuilder;
