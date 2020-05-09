import { applyTransparentColor, loadImage, replaceAll, replaceColors } from './ImageUtils';
import { resolvedPromise } from '../utils/PromiseUtils';
import Colors from '../types/Colors';

const NUM_CHARACTERS = 26 + 26 + 2 + 10;
const CHARACTERS = (() => {
  const characters = [];
  for (let c = 'A'.charCodeAt(0); c <= 'Z'.charCodeAt(0); c++) {
    characters.push(String.fromCodePoint(c));
  }
  for (let c = 'a'.charCodeAt(0); c <= 'z'.charCodeAt(0); c++) {
    characters.push(String.fromCodePoint(c));
  }
  for (let c = '0'.charCodeAt(0); c <= '9'.charCodeAt(0); c++) {
    characters.push(String.fromCodePoint(c));
  }
  characters.push(' ');
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
  PERFECT_DOS_VGA: <FontDefinition>{ name: 'PERFECT_DOS_VGA', src: 'dos_perfect_vga_9x15', width: 9, height: 15 }
};

class FontRenderer {
  private readonly _loadedFonts: { [name: string]: FontInstance };
  private readonly _imageMemos: { [key: string]: ImageBitmap };

  constructor() {
    this._loadedFonts = {};
    this._imageMemos = {};
  }

  render(text: string, font: FontDefinition, color: Colors): Promise<ImageBitmap> {
    const key = this._getMemoKey(text, font, color);
    if (!!this._imageMemos[key]) {
      return resolvedPromise(this._imageMemos[key]);
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
          const imageBitmap : ImageBitmap = fontInstance.imageMap[c] || fontInstance.imageMap[' ']; // TODO hacky placeholder
          context.drawImage(imageBitmap, x, 0, font.width, font.height);
        }
        return resolvedPromise();
      })
      .then(() => resolvedPromise(context.getImageData(0, 0, canvas.width, canvas.height)))
      .then(imageData => replaceColors(imageData, { [Colors.BLACK]: color }))
      .then(imageData => createImageBitmap(imageData))
      .then(imageBitmap => { this._imageMemos[key] = imageBitmap; return imageBitmap; });
  }

  private _loadFont(definition: FontDefinition): Promise<FontInstance> {
    if (this._loadedFonts[definition.name]) {
      return resolvedPromise(this._loadedFonts[definition.name]);
    }

    const width = NUM_CHARACTERS * definition.width;
    return loadImage(`fonts/${definition.src}`)
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
    return applyTransparentColor(imageData, Colors.WHITE);
  }

  /**
   * Note: fonts are in the format:
   * ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
   * A => 0
   * a => 27
   * 0 => 54
   */
  private _getCharOffset(char: number) {
    if (char >= 65 && char <= 90) {         // 'A' - 'Z'
      return char - 65;                     // 'A' = 0
    } else if (char >= 97 && char <= 122) { // 'a' - 'z'
      return char - 70;                     // 'a' = 27
    } else if (char >= 48 && char <= 57) {  // '0' - '9'
      return char + 6;                      // '0' = 54
    } else if (char === 32) {               // ' '
      return 26;
    } else {
      // TODO add other special chars
      return 26; // default to ' '
    }
    throw `invalid character code ${char}`;
  }

  private _getMemoKey(text: string, font: FontDefinition, color: Colors) {
    return `${font.name}_${color}_${text}`;
  }
}

export default FontRenderer;
export { Fonts, FontDefinition };