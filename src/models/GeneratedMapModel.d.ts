import { FogOfWarParams } from './FogOfWarParams';

export type GeneratedMapModel = {
  id: string;
  levelNumber: number;
  algorithm?: Algorithm;
  tileSet?: string;
  width: number;
  height: number;
  enemies: Range;
  items: Range;
  fogOfWar: FogOfWarParams;
};

export type Algorithm = 'ROOMS_AND_CORRIDORS' | 'ROOMS_AND_CORRIDORS_3' | 'PATH' | 'BLOB';

export type Range = {
  min: number;
  max: number;
};
