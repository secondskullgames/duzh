import { manhattanDistance } from '../maps/MapUtils';
import Coordinates from './Coordinates';
import { randChoice } from '../utils/random';

const CARDINAL_DIRECTIONS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

interface Node extends Coordinates {
  parent: Node | null,
  cost: number
}

class CoordinateSet {
  private readonly _jsonSet: Set<string>;

  constructor(coordinates: Coordinates[]) {
    this._jsonSet = new Set();
    for (const { x, y } of coordinates) {
      this.add({ x, y });
    }
  }

  add = ({ x, y }: Coordinates) => this._jsonSet.add(JSON.stringify({ x, y }));
  includes = ({ x, y }: Coordinates) => this._jsonSet.has(JSON.stringify({ x, y }));
}

type NodeWithCost = Readonly<{
  node: Node,
  cost: number
}>;

/**
 * @return the exact cost of the path from `start` to `coordinates`
 */
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
  for (let currentNode: (Node | null) = node; !!currentNode; currentNode = currentNode.parent) {
    const coordinates = { x: currentNode.x, y: currentNode.y };
    path.splice(0, 0, coordinates); // add it at the beginning of the list
  }
  return path;
};

/**
 * http://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html
 */
class Pathfinder {
  private readonly _tileCostCalculator: (first: Coordinates, second: Coordinates) => number;

  /**
   * http://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html
   */
  constructor(
    tileCostCalculator: (first: Coordinates, second: Coordinates) => number
  ) {
    this._tileCostCalculator = tileCostCalculator;
  }

  /**
   * http://theory.stanford.edu/~amitp/GameProgramming/ImplementationNotes.html#sketch
   *
   * @param tiles All allowable unblocked tiles
   * @return a path from {@code start} to {@code goal}, or an empty list if none was found
   */
  findPath = (start: Coordinates, goal: Coordinates, tiles: Coordinates[]): Coordinates[] => {
    const tileSet = new CoordinateSet(tiles);
    const t1 = new Date().getTime();
    const open: Node[] = [
      { x: start.x, y: start.y, cost: 0, parent: null }
    ];
    const closed: Coordinates[] = [];

    while (true) {
      if (open.length === 0) {
        return [];
      }

      const nodeCosts: NodeWithCost[] = open.map(node => ({ node, cost: f(node, start, goal) }))
        .sort((a, b) => a.cost - b.cost);

      const bestNode = nodeCosts[0].node;
      if (Coordinates.equals(bestNode, goal)) {
        // Done!
        const path = traverseParents(bestNode);
        const t2 = new Date().getTime();
        console.debug(`Found path in ${t2 - t1} ms`);
        return path;
      } else {
        const bestNodes: NodeWithCost[] = nodeCosts.filter(({ node, cost }) => cost === nodeCosts[0].cost);
        const { node: chosenNode, cost: chosenNodeCost }: NodeWithCost = randChoice(bestNodes);
        open.splice(open.indexOf(chosenNode), 1);
        closed.push(chosenNode);

        const neighbors = this._findNeighbors(chosenNode, tileSet);
        for (const neighbor of neighbors) {
          if (closed.some(coordinates => Coordinates.equals(coordinates, neighbor))) {
            // already been seen, don't need to look at it*
          } else if (open.some(coordinates => Coordinates.equals(coordinates, neighbor))) {
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
    CARDINAL_DIRECTIONS
      .map(([dx, dy]) => ({ x: tile.x + dx, y: tile.y + dy }))
      .filter(coordinates => tiles.includes(coordinates));
}

export default Pathfinder;
