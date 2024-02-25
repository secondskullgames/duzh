import { replaceAll } from './ImageUtils';
import Colors from '../Colors';

export type ImageEffect = {
  name: string;
  apply: (imageData: ImageData) => ImageData;
};

export namespace ImageEffect {
  export const DAMAGED: ImageEffect = {
    name: 'DAMAGED',
    apply: (img: ImageData) => replaceAll(img, Colors.WHITE)
  };
  export const BURNED: ImageEffect = {
    name: 'BURNED',
    apply: (img: ImageData) => replaceAll(img, Colors.ORANGE)
  };
  export const FROZEN: ImageEffect = {
    name: 'FROZEN',
    apply: (img: ImageData) => replaceAll(img, Colors.CYAN)
  };
}
