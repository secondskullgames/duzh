import { applyTransparentColor, replaceColors } from './ImageUtils';
import Color from '../types/Color';
import ImageLoader from './ImageLoader';

// Fonts are partial ASCII table consisting of the "printable characters", 32 to 126
const MIN_CHARACTER_CODE = 32;  // ' '
const MAX_CHARACTER_CODE = 126; // '~'
const NUM_CHARACTERS = MAX_CHARACTER_CODE - MIN_CHARACTER_CODE + 1;
const DEFAULT_CHAR = ' ';

const CHARACTERS = (() => {
  const characters = [];
  for (let c = MIN_CHARACTER_CODE; c <= MAX_CHARACTER_CODE; c++) {
    characters.push(String.fromCodePoint(c));
  }
  return characters;
})();

interface FontDefinition {
  name: string,
  src: string,
  width: number,
  height: number
}

interface FontInstance extends FontDefinition {
  imageMap: { [char: string]: ImageBitmap }
}

const Fonts = {
  PERFECT_DOS_VGA: <FontDefinition>{
    name: 'PERFECT_DOS_VGA',
    src: 'dos_perfect_vga_9x15_2',
    width: 9,
    height: 15
  }
};

class FontRenderer {
  private readonly _loadedFonts: { [name: string]: FontInstance };
  private readonly _imageMemos: { [key: string]: ImageBitmap };

  constructor() {
    this._loadedFonts = {};
    this._imageMemos = {};
  }

  render(text: string, font: FontDefinition, color: Color): Promise<ImageBitmap> {
    const key = this._getMemoKey(text, font, color);
    if (!!this._imageMemos[key]) {
      return Promise.resolve(this._imageMemos[key]);
    }

    const canvas = document.createElement('canvas');
    const context : CanvasRenderingContext2D = <any>canvas.getContext('2d');
    canvas.width = text.length * font.width;
    canvas.height = font.height;

    return this._loadFont(font)
      .then(fontInstance => {
        for (let i = 0; i < text.length; i++) {
          const c = text.charAt(i);
          const x = i * font.width;
          const imageBitmap : ImageBitmap = fontInstance.imageMap[c] || fontInstance.imageMap[DEFAULT_CHAR]; // TODO hacky placeholder
          context.drawImage(imageBitmap, x, 0, font.width, font.height);
        }
        return Promise.resolve();
      })
      .then(() => Promise.resolve(context.getImageData(0, 0, canvas.width, canvas.height)))
      .then(imageData => replaceColors(imageData, { [Color.BLACK]: color }))
      .then(imageData => createImageBitmap(imageData))
      .then(imageBitmap => { this._imageMemos[key] = imageBitmap; return imageBitmap; });
  }

  private _loadFont(definition: FontDefinition): Promise<FontInstance> {
    if (this._loadedFonts[definition.name]) {
      return Promise.resolve(this._loadedFonts[definition.name]);
    }

    const width = NUM_CHARACTERS * definition.width;
    return ImageLoader.loadImage(`fonts/${definition.src}`)
      .then(imageData => createImageBitmap(imageData))
      .then(imageBitmap => {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = width;
        canvas.height = definition.height;
        const context: CanvasRenderingContext2D = <any>canvas.getContext('2d');
        context.drawImage(imageBitmap, 0, 0);
        const imageMap: { [char: string]: ImageBitmap } = {};
        const promises: Promise<any>[] = [];
        CHARACTERS.forEach(c => {
          promises.push(this._getCharacterData(definition, context, c.charCodeAt(0))
            .then(imageData => createImageBitmap(imageData))
            .then(imageBitmap => {
              imageMap[c] = imageBitmap;
            }));
        });

        return Promise.all(promises)
          .then(() => {
            const fontInstance: FontInstance = {
              ...definition,
              imageMap
            };
            this._loadedFonts[definition.name] = fontInstance;
            return fontInstance;
          });
      });
  }

  private _getCharacterData(definition: FontDefinition, context: CanvasRenderingContext2D, char: number): Promise<ImageData> {
    const offset = this._getCharOffset(char);
    const imageData = context.getImageData(offset * definition.width, 0, definition.width, definition.height);
    return applyTransparentColor(imageData, Color.WHITE);
  }

  private _getCharOffset(char: number) {
    if (char >= MIN_CHARACTER_CODE && char <= MAX_CHARACTER_CODE) {
      return char - MIN_CHARACTER_CODE;
    }
    throw `invalid character code ${char}`;
  }

  private _getMemoKey(text: string, font: FontDefinition, color: Color) {
    return `${font.name}_${color}_${text}`;
  }
}

export default FontRenderer;
export { Fonts, FontDefinition };
