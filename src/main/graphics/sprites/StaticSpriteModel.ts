import Offsets from '../../geometry/Offsets';

type StaticSpriteModel = {
  name: string,
  filename: string,
  offsets: Offsets,
  transparentColor: string
};

const _load = async <T> (name: string): Promise<T> => (await import(
  /* webpackMode: "eager" */
  `../../../../data/sprites/static/${name}.json`
)).default;

namespace StaticSpriteModel {
  export const load = _load;
}

export default StaticSpriteModel;
