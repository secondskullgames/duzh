import { FogOfWarParams } from './FogOfWarParams';

export type GeneratedMapModel = Readonly<{
  id: string;
  levelNumber: number;
  algorithm?: Algorithm;
  tileSet?: string;
  width: number;
  height: number;
  enemies: Range;
  items: Range;
  fogOfWar: FogOfWarParams;
}>;

export type Algorithm = 'ROOMS_AND_CORRIDORS' | 'DEFAULT' | 'PATH' | 'BLOB';

export type Range = Readonly<{
  min: number;
  max: number;
}>;
