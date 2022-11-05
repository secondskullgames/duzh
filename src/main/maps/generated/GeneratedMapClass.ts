import { GeneratedMapModel } from '../../../gen-schema/generated-map.schema';
import { loadModel } from '../../utils/models';

type GeneratedMapClass = {
  layout: string,
  tileSet: string,
  levelNumber: number,
  width: number,
  height: number,
  enemies: {
    points: number,
    maxLevel: number
  },
  equipment: {
    points: number,
    maxLevel: number
  },
  items: {
    points: number,
    maxLevel: number
  }
};

const _fromModel = async (model: GeneratedMapModel): Promise<GeneratedMapClass> => {
  return {
    ...model,
    layout: model.layout,
    tileSet: model.tileSet
  };
};

namespace GeneratedMapClass {
  export const fromModel = _fromModel;
  export const load = async (id: string) => _fromModel(await loadModel(`maps/generated/${id}`, 'generated-map'));
}

export default GeneratedMapClass;
