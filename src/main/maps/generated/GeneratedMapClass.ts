import { GeneratedMapModel } from '../../../gen-schema/generated-map.schema';
import { loadModel } from '../../utils/models';
import MapLayout from '../MapLayout';

type GeneratedMapClass = {
  layout: MapLayout,
  tileSet: string,
  levelNumber: number,
  width: number,
  height: number,
  enemies: Record<string, number>,   // keys correspond to models in data/units
  equipment: Record<string, number>, // keys correspond to models in data/equipment
  items: Record<string, number>      // keys defined in ItemClass.ts
};

const _fromModel = async (model: GeneratedMapModel): Promise<GeneratedMapClass> => {
  return {
    ...model,
    layout: model.layout as MapLayout,
    tileSet: model.tileSet
  };
};

namespace GeneratedMapClass {
  export const fromModel = _fromModel;
  export const load = async (id: string) => _fromModel(await loadModel(`maps/generated/${id}`, 'generated-map'));
}

export default GeneratedMapClass;
