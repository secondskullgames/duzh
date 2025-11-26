import { Color } from '../Color.js';
import { PaletteSwaps } from '../PaletteSwaps.js';
import { RGB } from '../RGB.js';

export const applyTransparentColor = (
  imageData: ImageData,
  transparentColor: Color
): ImageData => {
  const array = new Uint8ClampedArray(imageData.data.length);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const a = imageData.data[i + 3];
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

export const replaceColors = (
  imageData: ImageData,
  colorMap: PaletteSwaps
): ImageData => {
  if (!colorMap) {
    return imageData;
  }

  const array = new Uint8ClampedArray(imageData.data.length);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const a = imageData.data[i + 3];
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
export const replaceAll = (imageData: ImageData, color: Color): ImageData => {
  const rgb = color.rgb;
  const array = new Uint8ClampedArray(imageData.data.length);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const a = imageData.data[i + 3];
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
