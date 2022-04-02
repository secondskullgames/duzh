/*
 * This file provides a schema for the JSON sprite models found in /data/sprites.
 */

import Offsets from '../../geometry/Offsets';
import SpriteCategory from './SpriteCategory';

type DynamicSpriteModel = {
  name: string,
  offsets: Offsets,
  pattern?: string,
  patterns?: string[],
  animations: {
    [name: string]: {
      pattern?: string,
      frames: {
        activity: string,
        number: string
      }[]
    }
  },
  transparentColor: string
}

const _load = async <T> (name: string, category: SpriteCategory): Promise<T> => (await import(
  /* webpackMode: "eager" */
  `../../../../data/sprites/${category}/${name}.json`
)).default;

namespace DynamicSpriteModel {
  export const load = _load;
}

export default DynamicSpriteModel;
