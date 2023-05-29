import { Pixel } from './Pixel';

export type Alignment = 'left' | 'center' | 'right';

export const drawAligned = (
  imageData: ImageData,
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
      left = Math.floor(x - imageData.width / 2);
      break;
    case 'right':
      left = x + imageData.width;
      break;
  }
  context.putImageData(imageData, left, y);
};
