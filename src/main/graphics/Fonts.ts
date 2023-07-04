import Colors from './Colors';
import { createCanvas, getCanvasContext } from '../utils/dom';
import { GlobalContext } from '../core/GlobalContext';

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

export enum FontName {
  PERFECT_DOS_VGA = 'PERFECT_DOS_VGA',
  PRESS_START_2P = 'PRESS_START_2P',
  APPLE_II = 'APPLE_II'
}

export type FontBundle = Readonly<{
  getFont(fontName: FontName): FontInstance
}>;

const fontDefinitions: Record<FontName, FontDefinition> = {
  [FontName.PERFECT_DOS_VGA]: {
    name: 'PERFECT_DOS_VGA',
    src: 'dos_perfect_vga_9x15_2',
    letterWidth: 9,
    letterHeight: 15
  },
  [FontName.PRESS_START_2P]: {
    name: 'PRESS_START_2P',
    src: 'press_start_2p_8x9',
    letterWidth: 8,
    letterHeight: 9
  },
  [FontName.APPLE_II]: {
    name: 'APPLE_II',
    src: 'apple_ii_9x9',
    letterWidth: 9,
    letterHeight: 9
  }
};

export type FontDefinition = Readonly<{
  name: string;
  src: string;
  letterWidth: number;
  letterHeight: number;
}>;

export type FontInstance = Readonly<{
  name: string,
  letterWidth: number,
  letterHeight: number,
  renderCharacter: (char: string) => ImageData
}>;

export const loadFonts = async (context: GlobalContext): Promise<FontBundle> => {
  const fonts: Partial<Record<FontName, FontInstance>> = {};
  for (const [fontName, fontDefinition] of Object.entries(fontDefinitions)) {
    const font: FontInstance = await _loadFont(fontDefinition, context);
    fonts[fontName as FontName] = font;
  }

  return {
    getFont: (fontName) => fonts[fontName]!
  }
};

const _loadFont = async (fontDefinition: FontDefinition, { imageFactory }: GlobalContext): Promise<FontInstance> => {
  const width = NUM_CHARACTERS * fontDefinition.letterWidth;
  const image = await imageFactory.getImage({
    filename: `fonts/${fontDefinition.src}`,
    transparentColor: Colors.WHITE
  });

  const canvas = createCanvas({
    width,
    height: fontDefinition.letterHeight,
    offscreen: true
  });
  const context = getCanvasContext(canvas);
  context.drawImage(image.bitmap, 0, 0);
  const imageDataMap: Record<string, ImageData> = {};

  for (const c of CHARACTERS) {
    imageDataMap[c] = _getCharacterData(fontDefinition, context, c.charCodeAt(0));
  }

  return {
    name: fontDefinition.name,
    letterWidth: fontDefinition.letterWidth,
    letterHeight: fontDefinition.letterHeight,
    renderCharacter: (char: string): ImageData => {
      return imageDataMap[char] ?? imageDataMap[DEFAULT_CHAR];
    }
  };
};

const _getCharacterData = (
  definition: FontDefinition,
  context: CanvasRenderingContext2D,
  char: number
) => {
  const offset = _getCharOffset(char);
  return context.getImageData(offset * definition.letterWidth, 0, definition.letterWidth, definition.letterHeight);
};

const _getCharOffset = (char: number) => {
  if (char >= MIN_CHARACTER_CODE && char <= MAX_CHARACTER_CODE) {
    return char - MIN_CHARACTER_CODE;
  }
  throw new Error(`invalid character code ${char}`);
};
