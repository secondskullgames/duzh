import { Color } from '@duzh/graphics';
import { ImageEffect, replaceAll } from '@duzh/graphics/images';

export namespace ImageEffects {
  export const DAMAGED: ImageEffect = {
    name: 'DAMAGED',
    apply: (img: ImageData) => replaceAll(img, Color.WHITE)
  };
  export const BURNING: ImageEffect = {
    name: 'BURNING',
    apply: (img: ImageData) => replaceAll(img, Color.fromHex('#ff8000')) // ORANGE
  };
  export const FROZEN: ImageEffect = {
    name: 'FROZEN',
    apply: (img: ImageData) => replaceAll(img, Color.fromHex('#00ffff')) // CYAN
  };
  export const SHOCKED: ImageEffect = {
    name: 'SHOCKED',
    apply: (img: ImageData) => replaceAll(img, Color.WHITE)
  };
}
