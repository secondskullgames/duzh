import { PaletteSwaps } from '../types/types';

type RGB = [number, number, number];

function loadImage(filename: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.style.display = 'none';

    const img: HTMLImageElement = document.createElement('img');

    img.addEventListener('load', () => {
      const context = canvas.getContext('2d');
      if (!context) {
        throw 'Couldn\'t get rendering context!';
      }
      context.drawImage(img, 0, 0);

      const imageData = context.getImageData(0, 0, img.width, img.height);
      if (img.parentElement) {
        img.parentElement.removeChild(img);
      }
      if (canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
      resolve(imageData);
    });

    img.style.display = 'none';
    img.onerror = () => {
      reject(`Failed to load image ${img.src}`);
    };
    img.src = `png/${filename}.png`;
    document.body.appendChild(canvas);
    document.body.appendChild(img);
  });
}

function applyTransparentColor(imageData: ImageData, transparentColor: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const [tr, tg, tb] = hex2rgb(transparentColor);
    const array = new Uint8ClampedArray(imageData.data.length);
    for (let i = 0; i < imageData.data.length; i += 4) {
      // @ts-ignore
      const [r, g, b, a] = imageData.data.slice(i, i + 4);
      array[i] = r;
      array[i + 1] = g;
      array[i + 2] = b;
      if (r === tr && g === tg && b === tb) {
        array[i + 3] = 0;
      } else {
        array[i + 3] = a;
      }
    }
    resolve(new ImageData(array, imageData.width, imageData.height));
  });
}

function replaceColors(imageData: ImageData, colorMap: PaletteSwaps): Promise<ImageData> {
  return new Promise(resolve => {
    if (!colorMap) {
      resolve(imageData);
    }
    const array = new Uint8ClampedArray(imageData.data.length);
    const entries: [string, string][] = <[any,any][]>Object.entries(colorMap);

    const srcRGB: { [hex: string]: RGB } = {};
    const destRGB: { [hex: string]: RGB } = {};
    entries.forEach(([srcColor, destColor]) => {
      srcRGB[srcColor] = hex2rgb(srcColor);
      destRGB[destColor] = hex2rgb(destColor);
    });

    for (let i = 0; i < imageData.data.length; i += 4) {
      // @ts-ignore
      const [r, g, b, a] = imageData.data.slice(i, i + 4);
      array[i] = r;
      array[i + 1] = g;
      array[i + 2] = b;
      array[i + 3] = a;
      for (let j = 0; j < entries.length; j++) {
        const [srcColor, destColor] = entries[j];
        const [sr, sg, sb] = srcRGB[srcColor];
        const [dr, dg, db] = destRGB[destColor];

        if (r === sr && g === sg && b === sb) {
          array[i] = dr;
          array[i + 1] = dg;
          array[i + 2] = db;
          break;
        }
      }
    }
    resolve(new ImageData(array, imageData.width, imageData.height));
  });
}

/**
 * Replace all non-transparent colors with the specified `color`.
 */
function replaceAll(imageData: ImageData, color: string): Promise<ImageData> {
  return new Promise(resolve => {
    const [dr, dg, db] = hex2rgb(color);
    const array = new Uint8ClampedArray(imageData.data.length);

    for (let i = 0; i < imageData.data.length; i += 4) {
      // @ts-ignore
      const [r, g, b, a] = imageData.data.slice(i, i + 4);
      array[i] = r;
      array[i + 1] = g;
      array[i + 2] = b;
      array[i + 3] = a;

      if (a > 0) {
        array[i] = dr;
        array[i + 1] = dg;
        array[i + 2] = db;
      }
    }
    resolve(new ImageData(array, imageData.width, imageData.height));
  });
}

/**
 * Convert a hex string, e.g. '#00c0ff', to its equivalent RGB values, e.g. (0, 192, 255).
 * This implementation relies on the browser automatically doing this conversion when
 * an element's `backgroundColor` value is set.
 */
function hex2rgb(hex: string): RGB {
  const div = document.createElement('div');
  div.style.backgroundColor = hex;
  // @ts-ignore
  return div.style.backgroundColor
    .split(/[(),]/)
    .map(c => parseInt(c))
    .filter(c => c != null && !isNaN(c));
}

export {
  loadImage,
  applyTransparentColor,
  replaceColors,
  replaceAll,
  hex2rgb
};
