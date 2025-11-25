import { replaceAll } from '@lib/graphics/images/ImageUtils';
import { ImageEffect } from '@lib/graphics/images/ImageEffect';
import { InterfaceColors } from '@main/graphics/InterfaceColors';

export namespace ImageEffects {
  export const DAMAGED: ImageEffect = {
    name: 'DAMAGED',
    apply: (img: ImageData) => replaceAll(img, InterfaceColors.WHITE)
  };
  export const BURNING: ImageEffect = {
    name: 'BURNING',
    apply: (img: ImageData) => replaceAll(img, InterfaceColors.ORANGE)
  };
  export const FROZEN: ImageEffect = {
    name: 'FROZEN',
    apply: (img: ImageData) => replaceAll(img, InterfaceColors.CYAN)
  };
  export const SHOCKED: ImageEffect = {
    name: 'WHITE',
    apply: (img: ImageData) => replaceAll(img, InterfaceColors.WHITE)
  };
}
