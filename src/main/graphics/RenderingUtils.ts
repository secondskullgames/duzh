import type { Pixel } from '../types/types';

type Alignment = 'left' | 'center' | 'right';

const drawAligned = async (imageBitmap: ImageBitmap, context: CanvasRenderingContext2D, { x, y }: Pixel, alignment: Alignment) => {
  let left;
  switch (alignment) {
    case 'left':
      left = x;
      break;
    case 'center':
      left = Math.floor(x - imageBitmap.width / 2);
      break;
    case 'right':
      left = x + imageBitmap.width;
      break;
    default:
      throw new Error();
  }
  await context.drawImage(imageBitmap, left, y);
};

export { drawAligned };
export type { Alignment };
