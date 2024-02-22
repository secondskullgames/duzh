import Coordinates from './Coordinates';
import Direction from './Direction';
import { manhattanDistance } from '../maps/MapUtils';
import { randChoice } from '../utils/random';

interface Node extends Coordinates {
  parent: Node | null;
  cost: number;
}

class CoordinateSet {
  private readonly _jsonSet: Set<string>;

  constructor(coordinates: Coordinates[]) {
    this._jsonSet = new Set();
    for (const { x, y } of coordinates) {
      this.add({ x, y });
    }
  }

  private _stringify = ({ x, y }: Coordinates) => `${x},${y}`;

  add = ({ x, y }: Coordinates) => this._jsonSet.add(this._stringify({ x, y }));
  includes = ({ x, y }: Coordinates) => this._jsonSet.has(this._stringify({ x, y }));
}

type NodeWithCost = Readonly<{
  node: Node;
  cost: number;
}>;

/**
 * @return the exact cost of the path from `start` to `coordinates`
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const g = (node: Node, start: Coordinates): number => node.cost;

/**
 * @return the heuristic estimated cost from `coordinates` to `goal`
 */
const h = (coordinates: Coordinates, goal: Coordinates): number => {
  // return civDistance(coordinates, goal);
  return manhattanDistance(coordinates, goal);
};

/**
 * @return an estimate of the best cost from `start` to `goal` combining both `g` and `h`
 */
const f = (node: Node, start: Coordinates, goal: Coordinates): number =>
  g(node, start) + h(node, goal);

const traverseParents = (node: Node): Coordinates[] => {
  const path: Coordinates[] = [];
  for (
    let currentNode: Node | null = node;
    currentNode;
    currentNode = currentNode.parent
  ) {
    const coordinates = { x: currentNode.x, y: currentNode.y };
    path.splice(0, 0, coordinates); // add it at the beginning of the list
  }
  return path;
};

export interface Pathfinder {
  findPath: (
    start: Coordinates,
    goal: Coordinates,
    tiles: Coordinates[]
  ) => Coordinates[];
}

export namespace Pathfinder {
  export const create = (
    tileCostCalculator: (first: Coordinates, second: Coordinates) => number
  ): Pathfinder => {
    return new PathfinderImpl(tileCostCalculator);
  };
}

/**
 * http://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html
 */
export class PathfinderImpl implements Pathfinder {
  private readonly _tileCostCalculator: (
    first: Coordinates,
    second: Coordinates
  ) => number;

  /**
   * http://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html
   */
  constructor(tileCostCalculator: (first: Coordinates, second: Coordinates) => number) {
    this._tileCostCalculator = tileCostCalculator;
  }

  /**
   * http://theory.stanford.edu/~amitp/GameProgramming/ImplementationNotes.html#sketch
   *
   * @param tiles All allowable unblocked tiles
   * @return a path from {@code start} to {@code goal}, or an empty list if none was found
   */
  findPath = (
    start: Coordinates,
    goal: Coordinates,
    tiles: Coordinates[]
  ): Coordinates[] => {
    const tileSet = new CoordinateSet(tiles);
    const open: Node[] = [{ x: start.x, y: start.y, cost: 0, parent: null }];
    const closed = new CoordinateSet([]);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (open.length === 0) {
        return [];
      }

      const nodeCosts: NodeWithCost[] = open
        .map(node => ({ node, cost: f(node, start, goal) }))
        .sort((a, b) => a.cost - b.cost);

      const bestNode = nodeCosts[0].node;
      if (Coordinates.equals(bestNode, goal)) {
        // Done!
        const path = traverseParents(bestNode);
        return path;
      } else {
        const bestNodes: NodeWithCost[] = nodeCosts.filter(
          ({ cost }) => cost === nodeCosts[0].cost
        );
        const { node: chosenNode, cost: chosenNodeCost }: NodeWithCost =
          randChoice(bestNodes);
        open.splice(open.indexOf(chosenNode), 1);
        closed.add(chosenNode);

        const neighbors = this._findNeighbors(chosenNode, tileSet);
        for (const neighbor of neighbors) {
          if (closed.includes(neighbor)) {
            // already been seen, don't need to look at it*
          } else if (
            open.some(coordinates => Coordinates.equals(coordinates, neighbor))
          ) {
            // don't need to look at it now, will look later?
          } else {
            const movementCost = this._tileCostCalculator(chosenNode, neighbor);
            open.push({
              x: neighbor.x,
              y: neighbor.y,
              cost: chosenNodeCost + movementCost,
              parent: chosenNode
            });
          }
        }
      }
    }
  };

  private _findNeighbors = (tile: Coordinates, tiles: CoordinateSet): Coordinates[] =>
    Direction.values()
      .map(({ dx, dy }) => ({ x: tile.x + dx, y: tile.y + dy }))
      .filter(coordinates => tiles.includes(coordinates));
}
