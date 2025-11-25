import { PathFinder_3rdParty } from './PathFinder_3rdParty.js';
import { Coordinates } from './Coordinates.js';

export interface Pathfinder {
  findPath: (
    start: Coordinates,
    goal: Coordinates,
    tiles: Coordinates[]
  ) => Coordinates[];
}

export enum Heuristic {
  MANHATTAN = 'MANHATTAN',
  EUCLIDEAN = 'EUCLIDEAN',
  CHEBYSHEV = 'CHEBYSHEV'
}

type Props = Readonly<{
  heuristic: Heuristic;
}>;

export namespace Pathfinder {
  export const create = (props?: Props): Pathfinder =>
    new PathFinder_3rdParty(props?.heuristic ?? Heuristic.MANHATTAN);
}
