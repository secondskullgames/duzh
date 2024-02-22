import Coordinates from './Coordinates';
import { PathfinderImpl } from './PathfinderImpl';
import { PathFinder_3rdParty } from './PathFinder_3rdParty';
import { Feature } from '../utils/features';

export interface Pathfinder {
  findPath: (
    start: Coordinates,
    goal: Coordinates,
    tiles: Coordinates[]
  ) => Coordinates[];
}

export namespace Pathfinder {
  export const create = (): Pathfinder => {
    if (Feature.isEnabled(Feature.PATHFINDER_3RD_PARTY)) {
      return new PathFinder_3rdParty();
    } else {
      return new PathfinderImpl(() => 1);
    }
  };
}
