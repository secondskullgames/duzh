import PaletteSwaps from '../../types/PaletteSwaps';
import RGB from './RGB';

type TraverseProps = {
  x: number,
  y: number,
  r: number, // red component
  g: number, // green component
  b: number, // blue component
  a: number, // alpha component
  i: number // starting index
};
type TraverseFunction = (props: TraverseProps) => Promise<void>;

const traverse = async (imageData: ImageData, traverseFunction: TraverseFunction) => {
  const promises: Promise<void>[] = [];
  for (let i = 0; i < imageData.data.length; i += 4) {
    const y = Math.floor(Math.floor(i / 4) / imageData.width);
    const x = Math.floor(i / 4) % imageData.width;
    const [r, g, b, a] = imageData.data.slice(i, i + 4);
    promises.push(traverseFunction({ x, y, r, g, b, a, i }));
  }
  await Promise.all(promises);
};

const applyTransparentColor = async (imageData: ImageData, transparentColor: string): Promise<ImageData> => {
  const transparentRGB = hex2rgb(transparentColor);
  const array = new Uint8ClampedArray(imageData.data.length);

  await traverse(imageData, async ({ r, g, b, a, i }) => {
    array[i] = r;
    array[i + 1] = g;
    array[i + 2] = b;

    if (RGB.equals({ r, g, b }, transparentRGB)) {
      array[i + 3] = 0;
    } else {
      array[i + 3] = a;
    }
  });

  return new ImageData(array, imageData.width, imageData.height);
};

const replaceColors = async (imageData: ImageData, colorMap: PaletteSwaps): Promise<ImageData> => {
  if (!colorMap) {
    return imageData;
  }

  const array = new Uint8ClampedArray(imageData.data.length);
  const entries: [string, string][] = Object.entries(colorMap);

  const sourceRGBMap: { [hex: string]: RGB } = {};
  const targetRGBMap: { [hex: string]: RGB } = {};

  for (const [sourceColor, targetColor] of entries) {
    sourceRGBMap[sourceColor] = hex2rgb(sourceColor);
    targetRGBMap[targetColor] = hex2rgb(targetColor);
  }

  await traverse(imageData, async ({ r, g, b, a, i }) => {
    array[i] = r;
    array[i + 1] = g;
    array[i + 2] = b;
    array[i + 3] = a;

    for (const [sourceColor, targetColor] of entries) {
      const sourceRGB = sourceRGBMap[sourceColor];
      const targetRGB = targetRGBMap[targetColor];

      if (RGB.equals({ r, g, b }, sourceRGB)) {
        array[i] = targetRGB.r;
        array[i + 1] = targetRGB.g;
        array[i + 2] = targetRGB.b;
        break;
      }
    }
  });

  return new ImageData(array, imageData.width, imageData.height);
};

/**
 * Replace all non-transparent colors with the specified `color`.
 */
const replaceAll = async (imageData: ImageData, color: string): Promise<ImageData> => {
  const rgb = hex2rgb(color);
  const array = new Uint8ClampedArray(imageData.data.length);

  await traverse(imageData, async ({ r, g, b, a, i }) => {
    array[i] = r;
    array[i + 1] = g;
    array[i + 2] = b;
    array[i + 3] = a;

    if (a > 0) {
      array[i] = rgb.r;
      array[i + 1] = rgb.g;
      array[i + 2] = rgb.b;
    }
  });

  return new ImageData(array, imageData.width, imageData.height);
};

/**
 * Convert a hex string, e.g. '#00c0ff', to its equivalent RGB values, e.g. (0, 192, 255).
 */
const hex2rgb = (hex: string): RGB  => {
  const trimmed = hex.match(/[0-9a-fA-F]+$/)?.[0];
  if (!trimmed) {
    throw new Error();
  }
  if (trimmed.length === 3) {
    return {
      r: parseInt(trimmed[0], 16) * 17,
      g: parseInt(trimmed[1], 16) * 17,
      b: parseInt(trimmed[2], 16) * 17
    };
  } else if (trimmed.length === 6) {
    return {
      r: parseInt(trimmed.slice(0, 2), 16),
      g: parseInt(trimmed.slice(2, 4), 16),
      b: parseInt(trimmed.slice(4, 6), 16)
    };
  } else {
    throw new Error();
  }
};

export {
  applyTransparentColor,
  replaceColors,
  replaceAll,
  hex2rgb,
  traverse as traverseImage
};
