import Color from './Color';
import Colors from './Colors';
import ImageFactory from './images/ImageFactory';
import { replaceColors } from './images/ImageUtils';
import PaletteSwaps from './PaletteSwaps';
import { createCanvas, createImage, getCanvasContext } from '../utils/dom';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './constants';
import { FontBundle, FontInstance, FontName } from './Fonts';
import { Image } from './images/Image';

type Props = Readonly<{
  imageFactory: ImageFactory,
  fonts: FontBundle
}>;

export class TextRenderer {
  private readonly imageFactory: ImageFactory;
  private readonly fonts: FontBundle;
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;

  private readonly imageCache: Record<string, Image> = {};

  constructor({ imageFactory, fonts }: Props) {
    this.imageFactory = imageFactory;
    this.fonts = fonts;
    this.canvas = createCanvas({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
    this.context = getCanvasContext(this.canvas);
  }

  renderText = async (text: string, fontName: FontName, color: Color): Promise<Image> => {
    const font = this.fonts.getFont(fontName);
    const key = _getCacheKey(text, font, color);
    if (this.imageCache[key]) {
      return this.imageCache[key];
    }

    const width = text.length * font.letterWidth;
    const height = font.letterHeight;

    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      const letterData = font.renderCharacter(char);
      this.context.putImageData(letterData, font.letterWidth * i, 0);
    }

    const imageData = this.context.getImageData(0, 0, width, height);

    const paletteSwaps = PaletteSwaps.builder()
      .addMapping(Colors.BLACK, color)
      .build();
    const swapped = replaceColors(imageData, paletteSwaps);
    const image = await Image.create({ imageData: swapped });

    this.imageCache[key] = image;
    return image;
  };
}

const _getCacheKey = (text: string, font: FontInstance, color: Color): string => {
  return `${font.name}_${color.hex}_${text}`;
};