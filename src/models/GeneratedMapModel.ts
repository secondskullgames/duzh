import { FogOfWarParams } from './FogOfWarParams';

export type GeneratedMapModel = Readonly<{
  id: string;
  levelNumber: number;
  algorithm?: Algorithm;
  tileSet?: string;
  width: number;
  height: number;
  enemies: {
    types: string[];
    min: number;
    max: number;
  };
  items: Range;
  fogOfWar: FogOfWarParams;
}>;

export enum Algorithm {
  ROOMS_AND_CORRIDORS = 'ROOMS_AND_CORRIDORS',
  DEFAULT = 'DEFAULT',
  PATH = 'PATH',
  BLOB = 'BLOB'
}

export type Range = Readonly<{
  min: number;
  max: number;
}>;
