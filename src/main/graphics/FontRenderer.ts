import Color from './Color';
import Colors from './Colors';
import ImageFactory from './images/ImageFactory';
import { replaceColors } from './images/ImageUtils';
import PaletteSwaps from './PaletteSwaps';
import { getOffscreenCanvasContext } from '../utils/dom';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './constants';

// Fonts are partial ASCII table consisting of the "printable characters", 32 to 126, i.e.
//  !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}
// (note the space before '!')
const MIN_CHARACTER_CODE = 32;  // ' '
const MAX_CHARACTER_CODE = 126; // '~'
const NUM_CHARACTERS = MAX_CHARACTER_CODE - MIN_CHARACTER_CODE + 1;
const DEFAULT_CHAR = ' ';

const CHARACTERS: string[] = [];
for (let c = MIN_CHARACTER_CODE; c <= MAX_CHARACTER_CODE; c++) {
  CHARACTERS.push(String.fromCodePoint(c));
}

export type FontDefinition = Readonly<{
  name: string;
  src: string;
  letterWidth: number;
  letterHeight: number;
}>;

export type FontInstance = Readonly<{
  renderCharacter: (char: string) => ImageData
}>;

const canvas = new OffscreenCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
const context = getOffscreenCanvasContext(canvas);

type Context = Readonly<{
  imageFactory: ImageFactory
}>;

export class FontRenderer {
  private readonly imageFactory: ImageFactory;

  private readonly _loadedFonts: Record<string, FontInstance> = {};
  private readonly _imageMemos: Record<string, ImageData> = {};

  constructor({ imageFactory }: Context) {
    this.imageFactory = imageFactory;
  }

  renderText = async (text: string, font: FontDefinition, color: Color): Promise<ImageData> => {
    const key = this._getMemoKey(text, font, color);
    if (this._imageMemos[key]) {
      return this._imageMemos[key];
    }
    console.time(`renderText ${text}`);

    const width = text.length * font.letterWidth;
    const height = font.letterHeight;

    const fontInstance = await this._loadFont(font);
    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      const letterData = fontInstance.renderCharacter(char);
      context.putImageData(letterData, font.letterWidth * i, 0);
    }

    const imageData = context.getImageData(0, 0, width, height);

    const paletteSwaps = PaletteSwaps.builder()
      .addMapping(Colors.BLACK, color)
      .build();
    const swapped = replaceColors(imageData, paletteSwaps);
    console.timeEnd(`renderText ${text}`);

    this._imageMemos[key] = swapped;
    return swapped;
  };

  private _loadFont = async (definition: FontDefinition): Promise<FontInstance> => {
    if (this._loadedFonts[definition.name]) {
      return this._loadedFonts[definition.name];
    }

    console.time(`Font ${definition.name}`);
    const width = NUM_CHARACTERS * definition.letterWidth;
    const image = await this.imageFactory.getImage({
      filename: `fonts/${definition.src}`,
      transparentColor: Colors.WHITE
    });

    const canvas = new OffscreenCanvas(
      width,
      definition.letterHeight
    );
    const context = getOffscreenCanvasContext(canvas);
    context.drawImage(image.bitmap, 0, 0);
    const imageDataMap: Record<string, ImageData> = {};

    for (const c of CHARACTERS) {
      imageDataMap[c] = this._getCharacterData(definition, context, c.charCodeAt(0));
    }

    const fontInstance: FontInstance = {
      renderCharacter: (char: string): ImageData => {
        return imageDataMap[char] ?? imageDataMap[DEFAULT_CHAR];
      }
    };

    this._loadedFonts[definition.name] = fontInstance;
    console.timeEnd(`Font ${definition.name}`);
    return fontInstance;
  };

  private _getCharacterData = (
    definition: FontDefinition,
    context: OffscreenCanvasRenderingContext2D,
    char: number
  ) => {
    const offset = this._getCharOffset(char);
    return context.getImageData(offset * definition.letterWidth, 0, definition.letterWidth, definition.letterHeight);
  };

  private _getCharOffset = (char: number) => {
    if (char >= MIN_CHARACTER_CODE && char <= MAX_CHARACTER_CODE) {
      return char - MIN_CHARACTER_CODE;
    }
    throw new Error(`invalid character code ${char}`);
  };

  private _getMemoKey = (text: string, font: FontDefinition, color: Color) => `${font.name}_${color.hex}_${text}`;
}