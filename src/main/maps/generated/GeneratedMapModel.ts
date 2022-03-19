import { TileSetName } from '../../tiles/TileSet';
import MapLayout from '../MapLayout';
import memoize from '../../utils/memoize';

type GeneratedMapModel = {
  layout: MapLayout,
  tileSet: TileSetName,
  levelNumber: number,
  width: number,
  height: number,
  enemies: Record<string, number>,   // keys correspond to models in data/units
  equipment: Record<string, number>, // keys correspond to models in data/equipment
  items: Record<string, number>      // keys defined in ItemClass.ts
};

const _load = async (id: string): Promise<GeneratedMapModel> => {
  const json = (await import(
    /* webpackMode: "eager" */
    `../../../../data/maps/generated/${id}.json`
  )).default;
  return { ...json, id };
};

namespace GeneratedMapModel {
  export const load = memoize(_load);
}

export default GeneratedMapModel;
