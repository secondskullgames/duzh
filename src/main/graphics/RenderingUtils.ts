import { Pixel } from './Pixel';
import { Graphics } from './Graphics';

export enum Alignment {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right'
}

export const drawAligned = (
  imageData: ImageData,
  graphics: Graphics,
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
  graphics.putImageData(imageData, { x: left, y });
};
