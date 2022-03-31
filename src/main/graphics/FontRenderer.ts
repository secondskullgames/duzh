import Color from './Color';
import Colors from './Colors';
import ImageFactory from './images/ImageFactory';
import { applyTransparentColor, replaceColors } from './images/ImageUtils';
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
  name: string,
  src: string,
  width: number,
  height: number
}

interface FontInstance extends FontDefinition {
  imageMap: Record<string, ImageBitmap>
}

const Fonts: Record<string, FontDefinition> = {
  PERFECT_DOS_VGA: {
    name: 'PERFECT_DOS_VGA',
    src: 'dos_perfect_vga_9x15_2',
    width: 9,
    height: 15
  },
  PRESS_START_2P: {
    name: 'PRESS_START_2P',
    src: 'press_start_2p_8x9',
    width: 8,
    height: 9
  },
  APPLE_II: {
    name: 'APPLE_II',
    src: 'apple_ii_9x9',
    width: 9,
    height: 9
  }
};

const _loadedFonts: Record<string, FontInstance> = {};
const _imageMemos: Record<string, ImageBitmap> = {};

const renderFont = async (text: string, font: FontDefinition, color: Color): Promise<ImageBitmap> => {
  const key = _getMemoKey(text, font, color);
  if (!!_imageMemos[key]) {
    return _imageMemos[key];
  }

  const canvas = document.createElement('canvas');
  const context : CanvasRenderingContext2D = <any>canvas.getContext('2d');
  canvas.width = text.length * font.width;
  canvas.height = font.height;

  const fontInstance = await _loadFont(font);
  for (let i = 0; i < text.length; i++) {
    const c = text.charAt(i);
    const x = i * font.width;
    const imageBitmap : ImageBitmap = fontInstance.imageMap[c] || fontInstance.imageMap[DEFAULT_CHAR]; // TODO hacky placeholder
    context.drawImage(imageBitmap, x, 0, font.width, font.height);
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const paletteSwaps = PaletteSwaps.builder()
    .addMapping(Colors.BLACK, color)
    .build();
  const imageBitmap = await replaceColors(imageData, paletteSwaps)
    .then(imageData => createImageBitmap(imageData));

  _imageMemos[key] = imageBitmap;
  return imageBitmap;
};

const _loadFont = async (definition: FontDefinition): Promise<FontInstance> => {
  if (_loadedFonts[definition.name]) {
    return _loadedFonts[definition.name];
  }

  const t1 = new Date().getTime();
  const width = NUM_CHARACTERS * definition.width;
  const image = await ImageFactory.getImage({
    filename: `fonts/${definition.src}`,
    transparentColor: Colors.WHITE
  });

  const canvas = document.createElement('canvas') as HTMLCanvasElement;
  canvas.width = width;
  canvas.height = definition.height;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  context.drawImage(image.bitmap, 0, 0);
  const imageMap: Record<string, ImageBitmap> = {};
  const promises: Promise<void>[] = [];

  for (const c of CHARACTERS) {
    promises.push(_getCharacterData(definition, context, c.charCodeAt(0))
      .then(imageData => createImageBitmap(imageData))
      .then(imageBitmap => {
        imageMap[c] = imageBitmap;
      }));
  }

  return Promise.all(promises)
    .then(() => {
      const fontInstance: FontInstance = {
        ...definition,
        imageMap
      };
      _loadedFonts[definition.name] = fontInstance;
      const t2 = new Date().getTime();
      console.debug(`Loaded font ${definition.name} in ${t2 - t1} ms`);
      return fontInstance;
    });
};

const _getCharacterData = async (definition: FontDefinition, context: CanvasRenderingContext2D, char: number) => {
  const offset = _getCharOffset(char);
  return context.getImageData(offset * definition.width, 0, definition.width, definition.height);
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
