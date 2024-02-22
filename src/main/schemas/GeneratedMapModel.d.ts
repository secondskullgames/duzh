type GeneratedMapModel = {
  levelNumber: number;
  width: number;
  height: number;
  enemies: { id: string; count: number }[];
  items?: { id: string; count: number }[];
  // TODO: consider combining with `items`
  equipment?: { id: string; count: number }[];
  objects?: { id: string; count: number }[];
  fogOfWar: {
    enabled: boolean;
    radius?: number;
  };
};

export default GeneratedMapModel;
