import { Pixel } from './Pixel';

export type Alignment = 'left' | 'center' | 'right';

export const drawAligned = (
  imageBitmap: ImageBitmap,
  context: CanvasRenderingContext2D,
  { x, y }: Pixel,
  alignment: Alignment
) => {
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
  }
  context.drawImage(imageBitmap, left, y);
};
