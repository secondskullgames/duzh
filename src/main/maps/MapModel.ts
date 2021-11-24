import { TileSetName } from '../types/TileSet';
import { MapLayout } from '../types/types';

type MapModel = {
  layout: MapLayout,
  tileSet: TileSetName,
  levelNumber: number,
  width: number,
  height: number,
  numEnemies: number,
  numItems: number,
  enemies: string[], // correspond to models in data/units
};

const _memos: Record<string, MapModel> = {};

const _load = async (id: string): Promise<MapModel> => {
  const json = (await import(`../../../data/maps/${id}.json`)).default;
  return { ...json, id };
};

namespace MapModel {
  export const load = async (id: string) => {
    if (!_memos[id]) {
      _memos[id] = await _load(id);
    }
    return _memos[id];
  };
}

export default MapModel;
