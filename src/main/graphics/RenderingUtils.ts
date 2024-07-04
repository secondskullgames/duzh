import { Pixel } from '@lib/geometry/Pixel';
import { Graphics } from '@lib/graphics/Graphics';
import { Image } from '@lib/graphics/images/Image';

export enum Alignment {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right'
}

export const drawAligned = (
  image: ImageData,
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
      left = x + image.width;
      break;
  }
  graphics.putImageData(image, { x: left, y });
};
