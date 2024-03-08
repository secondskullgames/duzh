import { FogOfWarParams } from './FogOfWarParams';

type GeneratedMapModel = {
  id: string;
  levelNumber: number;
  width: number;
  height: number;
  enemies: Range;
  items: Range;
  fogOfWar: FogOfWarParams;
};

export type Range = {
  min: number;
  max: number;
};

export default GeneratedMapModel;
