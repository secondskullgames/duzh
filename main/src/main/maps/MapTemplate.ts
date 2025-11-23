import { Figure } from '@lib/audio/types';
import { Coordinates } from '@lib/geometry/Coordinates';
import Grid from '@lib/geometry/Grid';
import MultiGrid from '@lib/geometry/MultiGrid';
import { ConsumableItemModel } from '@duzh/models';
import { DoorDirection } from '@duzh/models';
import { EquipmentModel } from '@duzh/models';
import { FogOfWarParams } from '@duzh/models';
import { TileType } from '@duzh/models';
import { UnitModel } from '@duzh/models';

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
  music: Figure[] | null;
  fogParams: FogOfWarParams;
}>;
