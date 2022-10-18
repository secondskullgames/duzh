import Color from './Color';
import Colors from './Colors';
import ImageFactory from './images/ImageFactory';
import { replaceColors } from './images/ImageUtils';
import PaletteSwaps from './PaletteSwaps';

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

interface FontDefinition {
  name: string;
  src: string;
  letterWidth: number;
  letterHeight: number;
}

interface FontInstance extends FontDefinition {
  imageDataMap: Record<string, ImageData>;
}

const Fonts: Record<string, FontDefinition> = {
  PERFECT_DOS_VGA: {
    name: 'PERFECT_DOS_VGA',
    src: 'dos_perfect_vga_9x15_2',
    letterWidth: 9,
    letterHeight: 15
  },
  PRESS_START_2P: {
    name: 'PRESS_START_2P',
    src: 'press_start_2p_8x9',
    letterWidth: 8,
    letterHeight: 9
  },
  APPLE_II: {
    name: 'APPLE_II',
    src: 'apple_ii_9x9',
    letterWidth: 9,
    letterHeight: 9
  }
};

const _loadedFonts: Record<string, FontInstance> = {};
const _imageMemos: Record<string, ImageBitmap> = {};

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d') as CanvasRenderingContext2D;

const renderFont = async (text: string, font: FontDefinition, color: Color): Promise<ImageBitmap> => {
  const key = _getMemoKey(text, font, color);
  if (_imageMemos[key]) {
    return _imageMemos[key];
  }
  const t1 = new Date().getTime();

  const width = text.length * font.letterWidth;
  const height = font.letterHeight;

  const imageData = context.createImageData(width, height);

  const fontInstance = await _loadFont(font);
  for (let i = 0; i < text.length; i++) {
    const c = text.charAt(i);
    const letterData = fontInstance.imageDataMap[c] || fontInstance.imageDataMap[DEFAULT_CHAR];
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
  const t2 = new Date().getTime();
  console.debug(`font rendered in ${t2 - t1} ms`);

  _imageMemos[key] = imageBitmap;
  return imageBitmap;
};

const _loadFont = async (definition: FontDefinition): Promise<FontInstance> => {
  if (_loadedFonts[definition.name]) {
    return _loadedFonts[definition.name];
  }

  const t1 = new Date().getTime();
  const width = NUM_CHARACTERS * definition.letterWidth;
  const image = await ImageFactory.getImage({
    filename: `fonts/${definition.src}`,
    transparentColor: Colors.WHITE
  });

  const canvas = document.createElement('canvas') as HTMLCanvasElement;
  canvas.width = width;
  canvas.height = definition.letterHeight;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  context.drawImage(image.bitmap, 0, 0);
  const imageDataMap: Record<string, ImageData> = {};

  for (const c of CHARACTERS) {
    imageDataMap[c] = _getCharacterData(definition, context, c.charCodeAt(0));
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

const _getCharacterData = (definition: FontDefinition, context: CanvasRenderingContext2D, char: number) => {
  const offset = _getCharOffset(char);
  return context.getImageData(offset * definition.letterWidth, 0, definition.letterWidth, definition.letterHeight);
};

const _getCharOffset = (char: number) => {
  if (char >= MIN_CHARACTER_CODE && char <= MAX_CHARACTER_CODE) {
    return char - MIN_CHARACTER_CODE;
  }
  throw new Error(`invalid character code ${char}`);
};

const _getMemoKey = (text: string, font: FontDefinition, color: Color) => `${font.name}_${color.hex}_${text}`;

export { renderFont };
export { Fonts, FontDefinition };
