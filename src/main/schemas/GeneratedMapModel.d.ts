type GeneratedMapModel = {
  levelNumber: number;
  width: number;
  height: number;
  enemies: Range;
  items: Range;
  equipment: Range;
  fogOfWar: {
    enabled: boolean;
    radius?: number;
  };
};

export type Range = {
  min: number;
  max: number;
};

export default GeneratedMapModel;
