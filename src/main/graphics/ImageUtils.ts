import PaletteSwaps from '../types/PaletteSwaps';

type RGB = [number, number, number];

const applyTransparentColor = async (imageData: ImageData, transparentColor: string): Promise<ImageData> => {
  const [tr, tg, tb] = hex2rgb(transparentColor);
  const array = new Uint8ClampedArray(imageData.data.length);

  for (let i = 0; i < imageData.data.length; i += 4) {
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

  return new ImageData(array, imageData.width, imageData.height);
};

const replaceColors = async (imageData: ImageData, colorMap: PaletteSwaps): Promise<ImageData> => {
  if (!colorMap) {
    return imageData;
  }

  const array = new Uint8ClampedArray(imageData.data.length);
  const entries: [string, string][] = Object.entries(colorMap);

  const srcRGB: { [hex: string]: RGB } = {};
  const destRGB: { [hex: string]: RGB } = {};
  for (const [srcColor, destColor] of entries) {
    srcRGB[srcColor] = hex2rgb(srcColor);
    destRGB[destColor] = hex2rgb(destColor);
  }

  for (let i = 0; i < imageData.data.length; i += 4) {
    // @ts-ignore
    const [r, g, b, a] = imageData.data.slice(i, i + 4);
    array[i] = r;
    array[i + 1] = g;
    array[i + 2] = b;
    array[i + 3] = a;

    for (const [srcColor, destColor] of entries) {
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

  return new ImageData(array, imageData.width, imageData.height);
};

/**
 * Replace all non-transparent colors with the specified `color`.
 */
const replaceAll = async (imageData: ImageData, color: string): Promise<ImageData> => {
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

  return new ImageData(array, imageData.width, imageData.height);
};

/**
 * Convert a hex string, e.g. '#00c0ff', to its equivalent RGB values, e.g. (0, 192, 255).
 * This implementation relies on the browser automatically doing this conversion when
 * an element's `backgroundColor` value is set.
 */
const hex2rgb = (hex: string): RGB  => {
  const div = document.createElement('div');
  div.style.backgroundColor = hex;
  // @ts-ignore
  return div.style.backgroundColor
    .split(/[(),]/)
    .map(c => parseInt(c))
    .filter(c => c != null && !isNaN(c));
};

export {
  applyTransparentColor,
  replaceColors,
  replaceAll,
  hex2rgb
};
