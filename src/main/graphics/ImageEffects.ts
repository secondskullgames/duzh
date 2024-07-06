import { replaceAll } from '@lib/graphics/images/ImageUtils';
import Colors from '@main/graphics/Colors';
import { ImageEffect } from '@lib/graphics/images/ImageEffect';

export namespace ImageEffects {
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
  export const SHOCKED: ImageEffect = {
    name: 'WHITE',
    apply: (img: ImageData) => replaceAll(img, Colors.WHITE)
  };
}
