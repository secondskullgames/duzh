import TileType from '../../tiles/TileType';

type PredefinedMapModel = {
  imageFilename: string,
  tileset: string,
  levelNumber: number,
  tileColors: Record<string, string>,
  defaultTile?: TileType
  enemyColors: Record<string, string>,
  itemColors: Record<string, string>,
  equipmentColors: Record<string, string>,
  doorColors: Record<string, string>,
  spawnerColors: Record<string, string>,
  startingPointColor: string,
  music: string | null
};

/**
 * TODO: Typescript can't really handle this because of the ...json.  As a result it's really easy for
 * code that should not compile at all to sneak in here.
 */
const _load = async (id: string): Promise<PredefinedMapModel> => (await import(
  /* webpackMode: "eager" */
  `../../../../data/maps/predefined/${id}.json`
)).default;

namespace PredefinedMapModel {
  export const load = _load;
}

export default PredefinedMapModel;
