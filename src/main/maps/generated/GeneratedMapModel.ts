type GeneratedMapModel = {
  layout: string,  // MapLayout
  tileSet: string, // TileSetName
  levelNumber: number,
  width: number,
  height: number,
  enemies: Record<string, number>,   // keys correspond to models in data/units
  equipment: Record<string, number>, // keys correspond to models in data/equipment
  items: Record<string, number>      // keys defined in ItemClass.ts
};

const _load = async (id: string): Promise<GeneratedMapModel> => (await import(
  /* webpackMode: "eager" */
  `../../../../data/maps/generated/${id}.json`
)).default;

namespace GeneratedMapModel {
  export const load = _load;
}

export default GeneratedMapModel;
