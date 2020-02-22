import { civDistance, contains, coordinatesEquals } from '../utils/MapUtils';
import { Coordinates, Rect } from '../types';
import { randChoice } from '../utils/RandomUtils';

const CARDINAL_DIRECTIONS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

interface Node extends Coordinates {
  parent?: Node,
  cost: number
}

/**
 * @return the exact cost of the path from `start` to `coordinates`
 */
function g(node: Node, start: Coordinates): number {
  return node.cost;
}

/**
 * @return the heuristic estimated cost from `coordinates` to `goal`
 */
function h(coordinates: Coordinates, goal: Coordinates): number {
  return civDistance(coordinates, goal);

  // return manhattanDistance(coordinates, goal);
}

/**
 * @return an estimate of the best cost from `start` to `goal` combining both `g` and `h`
 */
function f(node: Node, start: Coordinates, goal: Coordinates): number {
  return g(node, start) + h(node, goal);
}

function traverseParents(node: Node): Coordinates[] {
  const path = [];
  for (let currentNode = node; !!currentNode; currentNode = currentNode.parent) {
    const coordinates = { x: currentNode.x, y: currentNode.y };
    path.splice(0, 0, coordinates); // add it at the beginning of the list
  }
  return path;
}

/**
 * http://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html
 */
class Pathfinder {
  private readonly blockedTileDetector: (coordinates: Coordinates) => boolean;
  private readonly tileCostCalculator: (first: Coordinates, second: Coordinates) => number;
  /**
   * http://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html
   */
  constructor(
    blockedTileDetector: ({ x, y }: Coordinates) => boolean,
    tileCostCalculator: (first: Coordinates, second: Coordinates) => number
  ) {
    this.blockedTileDetector = blockedTileDetector;
    this.tileCostCalculator = tileCostCalculator;
  }

  /**
   * http://theory.stanford.edu/~amitp/GameProgramming/ImplementationNotes.html#sketch
   */
  findPath(start: Coordinates, goal: Coordinates, rect: Rect): Coordinates[] {
    const open: Node[] = [
      { x: start.x, y: start.y, cost: 0, parent: null }
    ];
    /**
     * @type {!Coordinates[]}
     */
    const closed = [];

    while (true) {
      if (open.length === 0) {
        return [];
      }

      type NodeWithCost = { node: Node, cost: number };

      const nodeCosts: NodeWithCost[] = open.map(node => ({ node, cost: f(node, start, goal) }))
        .sort((a, b) => b[1] - a[1]);

      const bestNode = nodeCosts[0].node;
      if (coordinatesEquals(bestNode, goal)) {
        // Done!
        const path: Coordinates[] = traverseParents(bestNode);
        //console.log(`path = ${JSON.stringify(path)}`);
        return path;
      } else {
        const bestNodes: NodeWithCost[] = nodeCosts.filter(({ node, cost }) => cost === nodeCosts[0].cost);
        const { node: chosenNode, cost: chosenNodeCost }: NodeWithCost = randChoice(bestNodes);
        open.splice(open.indexOf(chosenNode), 1);
        closed.push(chosenNode);
        this._findNeighbors(chosenNode, rect).forEach(neighbor => {
          if (closed.some(coordinates => coordinatesEquals(coordinates, neighbor))) {
            // already been seen, don't need to look at it*
          } else if (open.some(coordinates => coordinatesEquals(coordinates, neighbor))) {
            // don't need to look at it now, will look later?
          } else {
            const movementCost = this.tileCostCalculator(chosenNode, neighbor);
            open.push({
              x: neighbor.x,
              y: neighbor.y,
              cost: chosenNodeCost + movementCost,
              parent: chosenNode
            });
          }
        });
      }
    }
  }

  private _findNeighbors(tile: Coordinates, rect): Coordinates[] {
    return CARDINAL_DIRECTIONS
      .map(([dx, dy]) => ({ x: tile.x + dx, y: tile.y + dy }))
      .filter(({ x, y }) => contains(rect, { x, y }))
      .filter(({ x, y }) => !this.blockedTileDetector({ x, y }));
  }
}

export default Pathfinder;
