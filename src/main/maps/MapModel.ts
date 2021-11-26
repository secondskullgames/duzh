import { TileSetName } from '../types/TileSet';
import { MapLayout } from '../types/types';
import memoize from '../utils/memoize';

type MapModel = {
  layout: MapLayout,
  tileSet: TileSetName,
  levelNumber: number,
  width: number,
  height: number,
  numEnemies: number,
  numItems: number,
  enemies: string[],   // correspond to models in data/units
  equipment: string[], // correspond to models in data/equipment
  items: string[]      // defined in ItemClass.ts
};

const _load = async (id: string): Promise<MapModel> => {
  const json = (await import(`../../../data/maps/${id}.json`)).default;
  return { ...json, id };
};

namespace MapModel {
  export const load = memoize(_load);
}

export default MapModel;
