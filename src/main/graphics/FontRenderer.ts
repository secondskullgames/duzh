import Color from './Color';
import Colors from './Colors';
import ImageFactory from './images/ImageFactory';
import { replaceColors } from './images/ImageUtils';
import PaletteSwaps from './PaletteSwaps';
import { createCanvas, getCanvasContext } from '../utils/dom';
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

export interface FontDefinition {
  name: string;
  src: string;
  letterWidth: number;
  letterHeight: number;
}

export interface FontInstance extends FontDefinition {
  imageDataMap: Record<string, ImageData>;
}

const _loadedFonts: Record<string, FontInstance> = {};
const _imageMemos: Record<string, ImageBitmap> = {};

// TODO this didn't specify dimensions previously
const canvas = createCanvas({
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT
});
const context = getCanvasContext(canvas);

type Context = Readonly<{
  imageFactory: ImageFactory
}>;

export class FontRenderer {
  private readonly imageFactory: ImageFactory;

  constructor({ imageFactory }: Context) {
    this.imageFactory = imageFactory;
  }

  renderFont = async (text: string, font: FontDefinition, color: Color): Promise<ImageBitmap> => {
    const key = this._getMemoKey(text, font, color);
    if (_imageMemos[key]) {
      return _imageMemos[key];
    }
    console.time('font');

    const width = text.length * font.letterWidth;
    const height = font.letterHeight;

    const imageData = context.createImageData(width, height);

    const fontInstance = await this._loadFont(font);
    for (let i = 0; i < text.length; i++) {
      const c = text.charAt(i);
      const letterData = fontInstance.imageDataMap[c] ?? fontInstance.imageDataMap[DEFAULT_CHAR];
      for (let y = 0; y < fontInstance.letterHeight; y++) {
        for (let x = 0; x < fontInstance.letterWidth; x++) {
          const inPosition = 4 * ((y * fontInstance.letterWidth) + x);
          const outPosition = 4 * ((y * width) + x + (fontInstance.letterWidth * i));
          for (let j = 0; j <= 3; j++) {
            imageData.data[outPosition + j] = letterData.data[inPosition + j];
          }
        }
      }
    }

    const paletteSwaps = PaletteSwaps.builder()
      .addMapping(Colors.BLACK, color)
      .build();
    const imageBitmap = await createImageBitmap(replaceColors(imageData, paletteSwaps));
    console.timeEnd('font');

    _imageMemos[key] = imageBitmap;
    return imageBitmap;
  };

  private _loadFont = async (definition: FontDefinition): Promise<FontInstance> => {
    if (_loadedFonts[definition.name]) {
      return _loadedFonts[definition.name];
    }

    const t1 = new Date().getTime();
    const width = NUM_CHARACTERS * definition.letterWidth;
    const image = await this.imageFactory.getImage({
      filename: `fonts/${definition.src}`,
      transparentColor: Colors.WHITE
    });

    const canvas = createCanvas({
      width,
      height: definition.letterHeight
    });
    const context = getCanvasContext(canvas);
    context.drawImage(image.bitmap, 0, 0);
    const imageDataMap: Record<string, ImageData> = {};

    for (const c of CHARACTERS) {
      imageDataMap[c] = this._getCharacterData(definition, context, c.charCodeAt(0));
    }

    const fontInstance: FontInstance = {
      ...definition,
      imageDataMap
    };

    _loadedFonts[definition.name] = fontInstance;
    const t2 = new Date().getTime();
    console.debug(`Loaded font ${definition.name} in ${t2 - t1} ms`);
    return fontInstance;
  };

  private _getCharacterData = (definition: FontDefinition, context: CanvasRenderingContext2D, char: number) => {
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