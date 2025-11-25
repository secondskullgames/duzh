import {
  ConsumableItemModel,
  DoorDirection,
  EquipmentModel,
  FogOfWarParams,
  MusicModel,
  TileType,
  UnitModel
} from '@duzh/models';
import { Coordinates } from '@lib/geometry/Coordinates';
import Grid from '@lib/geometry/Grid';
import MultiGrid from '@lib/geometry/MultiGrid';

/** TODO: really need to clean up data representation of other object types */
export type ObjectTemplate =
  | Readonly<{ type: 'door'; direction: DoorDirection; locked: boolean }>
  | Readonly<{ type: 'spawner' }>
  | Readonly<{ type: 'movable_block' }>
  | Readonly<{ type: 'vines' }>
  | Readonly<{ type: 'mirror' }>
  | Readonly<{ type: 'shrine' }>
  | Readonly<{ type: 'item'; model: ConsumableItemModel }>
  | Readonly<{ type: 'equipment'; model: EquipmentModel }>;

export type ObjectType = ObjectTemplate['type'];
export type ItemOrEquipment = ObjectTemplate & { type: 'item' | 'equipment' };

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
