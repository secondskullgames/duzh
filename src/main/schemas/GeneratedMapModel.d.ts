type GeneratedMapModel = {
  levelNumber: number;
  width: number;
  height: number;
  enemies: Range;
  items: Range;
  equipment: Range;
  objects: Range;
};

export type Range = {
  min: number;
  max: number;
};

export default GeneratedMapModel;
