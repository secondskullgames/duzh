type GeneratedMapModel = {
  layout: string,
  tileSet: string,
  levelNumber: number,
  width: number,
  height: number,
  pointAllocation: GeneratedMapModel_PointAllocation
};

type GeneratedMapModel_PointAllocation = {
  enemies: number,
  equipment: number,
  items: number
};

export default GeneratedMapModel;
export type { GeneratedMapModel_PointAllocation };