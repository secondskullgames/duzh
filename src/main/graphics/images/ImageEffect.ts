import Colors from '../Colors';
import { replaceAll } from './ImageUtils';

export type ImageEffect = {
  name: string,
  apply: (imageData: ImageData) => ImageData
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
}
