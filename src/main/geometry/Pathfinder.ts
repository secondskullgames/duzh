import Coordinates from './Coordinates';
import { PathFinder_3rdParty } from './PathFinder_3rdParty';

export interface Pathfinder {
  findPath: (
    start: Coordinates,
    goal: Coordinates,
    tiles: Coordinates[]
  ) => Coordinates[];
}

export namespace Pathfinder {
  export const create = (): Pathfinder => new PathFinder_3rdParty();
}
