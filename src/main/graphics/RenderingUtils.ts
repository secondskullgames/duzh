import { Pixel } from './Pixel';

export enum Alignment {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right'
}

export const drawAligned = (
  imageData: ImageData,
  context: CanvasRenderingContext2D,
  { x, y }: Pixel,
  alignment: Alignment
) => {
  let left: number;
  switch (alignment) {
    case Alignment.LEFT:
      left = x;
      break;
    case Alignment.CENTER:
      left = Math.floor(x - imageData.width / 2);
      break;
    case Alignment.RIGHT:
      left = x + imageData.width;
      break;
  }
  context.putImageData(imageData, left, y);
};
