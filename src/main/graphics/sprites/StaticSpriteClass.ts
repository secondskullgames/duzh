import Offsets from '../../geometry/Offsets';
import Color from '../Color';
import StaticSpriteModel from './StaticSpriteModel';

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
  export const load = async (id: string) => fromModel(await StaticSpriteModel.load(id));
}

export default StaticSpriteClass;
