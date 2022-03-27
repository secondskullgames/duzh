import Color from '../Color';
import PaletteSwaps from '../PaletteSwaps';
import RGB from '../RGB';

const applyTransparentColor = async (imageData: ImageData, transparentColor: Color): Promise<ImageData> => {
  const array = new Uint8ClampedArray(imageData.data.length);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const [r, g, b, a] = imageData.data.slice(i, i + 4);
    array[i] = r;
    array[i + 1] = g;
    array[i + 2] = b;

    if (RGB.equals({ r, g, b }, transparentColor.rgb)) {
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

  for (let i = 0; i < imageData.data.length; i += 4) {
    const [r, g, b, a] = imageData.data.slice(i, i + 4);
    array[i] = r;
    array[i + 1] = g;
    array[i + 2] = b;
    array[i + 3] = a;

    for (const [sourceColor, targetColor] of colorMap.entries()) {
      const sourceRGB = sourceColor.rgb;
      const targetRGB = targetColor.rgb;

      if (RGB.equals({ r, g, b }, sourceRGB)) {
        array[i] = targetRGB.r;
        array[i + 1] = targetRGB.g;
        array[i + 2] = targetRGB.b;
        break;
      }
    }
  }

  return new ImageData(array, imageData.width, imageData.height);
};

/**
 * Replace all non-transparent colors with the specified `color`.
 */
const replaceAll = async (imageData: ImageData, color: Color): Promise<ImageData> => {
  const rgb = color.rgb;
  const array = new Uint8ClampedArray(imageData.data.length);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const [r, g, b, a] = imageData.data.slice(i, i + 4);
    array[i] = r;
    array[i + 1] = g;
    array[i + 2] = b;
    array[i + 3] = a;

    if (a > 0) {
      array[i] = rgb.r;
      array[i + 1] = rgb.g;
      array[i + 2] = rgb.b;
    }
  }

  return new ImageData(array, imageData.width, imageData.height);
};

export {
  applyTransparentColor,
  replaceAll,
  replaceColors
};
