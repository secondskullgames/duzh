import { DynamicSpriteModel } from '../../../gen-schema/dynamic-sprite.schema';
import Offsets from '../../geometry/Offsets';
import { loadModel } from '../../utils/models';
import Color from '../Color';
import Colors from '../Colors';
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
  transparentColor: model.transparentColor ? Colors[model.transparentColor] : null
});

namespace DynamicSpriteClass {
  export const fromModel = _fromModel;
  export const load = async (id: string, category: SpriteCategory) => _fromModel(await loadModel(`sprites/${category}/${id}`, 'dynamic-sprite'));
}

export default DynamicSpriteClass;
