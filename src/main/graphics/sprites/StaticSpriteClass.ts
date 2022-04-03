import { StaticSpriteModel } from '../../../gen-schema/static-sprite.schema';
import Offsets from '../../geometry/Offsets';
import { loadModel } from '../../utils/models';
import Color from '../Color';

type StaticSpriteClass = {
  name: string,
  filename: string,
  offsets: Offsets,
  transparentColor: Color | null
};

const _fromModel = async (model: StaticSpriteModel): Promise<StaticSpriteClass> => ({
  ...model,
  transparentColor: model.transparentColor ? Color.fromHex(model.transparentColor) : null
});

namespace StaticSpriteClass {
  export const fromModel = _fromModel;
  export const load = async (id: string) => _fromModel(await loadModel(`sprites/static/${id}`, 'static-sprite'));
}

export default StaticSpriteClass;
