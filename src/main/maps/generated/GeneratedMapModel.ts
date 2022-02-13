import { TileSetName } from '../../tiles/TileSet';
import { MapLayout } from '../../types/types';
import memoize from '../../utils/memoize';

type GeneratedMapModel = {
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

const _load = async (id: string): Promise<GeneratedMapModel> => {
  const json = (await import(`../../../../data/maps/generated/${id}.json`)).default;
  return { ...json, id };
};

namespace GeneratedMapModel {
  export const load = memoize(_load);
}

export default GeneratedMapModel;
