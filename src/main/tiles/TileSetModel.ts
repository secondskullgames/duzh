type TileSetModel = {
  path: string,
  tiles: Record<string, (string | null)[]>, // keys are TileType
  paletteSwaps?: Record<string, string>
};

const _load = async (id: string): Promise<TileSetModel> => (await import(
  /* webpackMode: "eager" */
  `../../../data/tilesets/${id}.json`
)).default;

namespace TileSetModel {
  export const load = _load;
}

export default TileSetModel;
