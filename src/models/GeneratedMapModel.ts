import { FogOfWarParams } from './FogOfWarParams';

export type GeneratedMapModel = Readonly<{
  id: string;
  levelNumber: number;
  algorithm: Algorithm;
  tileSet: string;
  width: number;
  height: number;
  enemies: {
    /* By convention, these should add up to 1.0 */
    types: { chance: number; type: string }[];
    min: number;
    max: number;
  };
  items: Range;
  shrines: number;
  fogOfWar: FogOfWarParams;
}>;

export enum Algorithm {
  ROOMS_AND_CORRIDORS = 'ROOMS_AND_CORRIDORS',
  DEFAULT = 'DEFAULT',
  PATH = 'PATH',
  BLOB = 'BLOB',
  RANDOM = 'RANDOM'
}

export type Range = Readonly<{
  min: number;
  max: number;
}>;
