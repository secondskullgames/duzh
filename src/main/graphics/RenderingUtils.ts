import { Pixel } from './Pixel';
import { Graphics } from './Graphics';
import { Image } from './images/Image';

export enum Alignment {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right'
}

export const drawAligned = (
  image: Image,
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
      left = Math.floor(x - image.width / 2);
      break;
    case Alignment.RIGHT:
      left = x - image.width;
      break;
  }
  graphics.drawImage(image, { x: left, y });
};
