import { z } from 'zod';

export enum TileType {
  FLOOR = 'FLOOR',
  FLOOR_HALL = 'FLOOR_HALL',
  WALL_TOP = 'WALL_TOP',
  WALL_HALL = 'WALL_HALL',
  WALL = 'WALL',
  NONE = 'NONE',
  STAIRS_DOWN = 'STAIRS_DOWN',
  STAIRS_UP = 'STAIRS_UP'
}

export namespace TileType {
  export const isBlocking = (tileType: TileType): boolean => {
    switch (tileType) {
      case TileType.WALL_HALL:
      case TileType.WALL_TOP:
      case TileType.WALL:
      case TileType.NONE:
        return true;
      default:
        return false;
    }
  };
}

// TODO broken by declaration merging, will fix later
// export const TileTypeSchema = z.enum(TileType);
