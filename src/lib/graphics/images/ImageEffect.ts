import { replaceAll } from './ImageUtils';
import Colors from '@main/graphics/Colors';

export type ImageEffect = {
  name: string;
  apply: (imageData: ImageData) => ImageData;
};

export namespace ImageEffect {
  export const DAMAGED: ImageEffect = {
    name: 'DAMAGED',
    apply: (img: ImageData) => replaceAll(img, Colors.WHITE)
  };
  export const BURNING: ImageEffect = {
    name: 'BURNING',
    apply: (img: ImageData) => replaceAll(img, Colors.ORANGE)
  };
  export const FROZEN: ImageEffect = {
    name: 'FROZEN',
    apply: (img: ImageData) => replaceAll(img, Colors.CYAN)
  };
}
