/*
 * This file provides a schema for the JSON sprite models found in /data/sprites.
 */

import Offsets from '../../geometry/Offsets';
import Color from '../Color';
import DynamicSpriteModel from './DynamicSpriteModel';
import SpriteCategory from './SpriteCategory';

type DynamicSpriteClass = {
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
  transparentColor: Color | null
}

const _fromModel = async (model: DynamicSpriteModel): Promise<DynamicSpriteClass> => ({
  ...model,
  transparentColor: model.transparentColor ? Color.fromHex(model.transparentColor) : null
});

namespace DynamicSpriteClass {
  export const fromModel = _fromModel;
  export const load = async (id: string, category: SpriteCategory) => fromModel(await DynamicSpriteModel.load(id, category));
}

export default DynamicSpriteClass;
