import { manhattanDistance } from '../maps/MapUtils';
import Coordinates from '../types/Coordinates';
import { randChoice } from './random';

const CARDINAL_DIRECTIONS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

interface Node extends Coordinates {
  parent: Node | null,
  cost: number
}

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
   */
  findPath = (start: Coordinates, goal: Coordinates, tiles: Coordinates[]): Coordinates[] => {
    const open: Node[] = [
      { x: start.x, y: start.y, cost: 0, parent: null }
    ];
    const closed: Coordinates[] = [];

    while (true) {
      if (open.length === 0) {
        return [];
      }

      type NodeWithCost = { node: Node, cost: number };

      const nodeCosts: NodeWithCost[] = open.map(node => ({ node, cost: f(node, start, goal) }))
        .sort((a, b) => a.cost - b.cost);

      const bestNode = nodeCosts[0].node;
      if (Coordinates.equals(bestNode, goal)) {
        // Done!
        return traverseParents(bestNode);
      } else {
        const bestNodes: NodeWithCost[] = nodeCosts.filter(({ node, cost }) => cost === nodeCosts[0].cost);
        const { node: chosenNode, cost: chosenNodeCost }: NodeWithCost = randChoice(bestNodes);
        open.splice(open.indexOf(chosenNode), 1);
        closed.push(chosenNode);

        const neighbors = this._findNeighbors(chosenNode, tiles);
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

  private _findNeighbors = (tile: Coordinates, tiles: Coordinates[]): Coordinates[] =>
    CARDINAL_DIRECTIONS
      .map(([dx, dy]) => ({ x: tile.x + dx, y: tile.y + dy }))
      .filter(({ x, y }) => tiles.some(tile => Coordinates.equals(tile, { x, y })));
}

export default Pathfinder;
