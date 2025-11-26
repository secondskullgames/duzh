import { FogOfWarParams, MusicModel, TileType, UnitModel } from '@duzh/models';
import { Coordinates, Grid, MultiGrid } from '@duzh/geometry';
import { ObjectTemplate } from './ObjectTemplate.js';

export type MapTemplate = Readonly<{
  id: string;
  width: number;
  height: number;
  levelNumber: number;
  startingCoordinates: Coordinates;
  tiles: Grid<TileType>;
  tileSet: string;
  units: Grid<UnitModel>;
  objects: MultiGrid<ObjectTemplate>;
  music: MusicModel | null;
  fogParams: FogOfWarParams;
}>;
