import Color from './Color';
import Colors from './Colors';
import ImageFactory from './images/ImageFactory';
import { replaceColors } from './images/ImageUtils';
import PaletteSwaps from './PaletteSwaps';
import { getOffscreenCanvasContext } from '../utils/dom';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './constants';
import { FontBundle, FontInstance, FontName } from './Fonts';
import { checkNotNull } from '../utils/preconditions';

type Props = Readonly<{
  imageFactory: ImageFactory,
  fonts: FontBundle
}>;

export class TextRenderer {
  private readonly imageFactory: ImageFactory;
  private readonly fonts: FontBundle;
  private readonly canvas: OffscreenCanvas;
  private readonly context: OffscreenCanvasRenderingContext2D;

  private readonly _imageMemos: Record<string, ImageData> = {};

  constructor({ imageFactory, fonts }: Props) {
    this.imageFactory = imageFactory;
    this.fonts = fonts;
    this.canvas = new OffscreenCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
    this.context = getOffscreenCanvasContext(this.canvas);
  }

  renderText = async (text: string, fontName: FontName, color: Color): Promise<ImageData> => {
    const font = checkNotNull(this.fonts[fontName]);
    const key = this._getMemoKey(text, font, color);
    if (this._imageMemos[key]) {
      return this._imageMemos[key];
    }
    console.time(`renderText ${text}`);

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
    console.timeEnd(`renderText ${text}`);

    this._imageMemos[key] = swapped;
    return swapped;
  };

  private _getMemoKey = (text: string, font: FontInstance, color: Color): string => {
    return `${font.name}_${color.hex}_${text}`;
  };
}