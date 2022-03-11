/*
 * This file provides a schema for the JSON sprite models found in /data/sprites.
 */

import Offsets from '../../geometry/Offsets';

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

export default DynamicSpriteModel;
