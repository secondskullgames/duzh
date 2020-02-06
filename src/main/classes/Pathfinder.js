{
  const CARDINAL_DIRECTIONS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

  /**
   * @typedef Node
   * @property {!int} x
   * @property {!int} y
   * @property {?Node} parent
   * @property {!int} cost
   */

  /**
   * http://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html
   *
   * @param {!function(!Coordinates): !boolean} blockedTileDetector
   * @param {!function(!Coordinates, !Coordinates): !number} tileCostCalculator
   * @constructor
   */
  function Pathfinder(blockedTileDetector, tileCostCalculator) {
    /**
     * @param {!Node} node
     * @param {!Coordinates} start
     * @return {!int} the exact cost of the path from `start` to `coordinates`
     */
    function g(node, start) {
      return node.cost;
    }

    /**
     * @param {!Coordinates} coordinates
     * @param {!Coordinates} goal
     * @return {!int} the heuristic estimated cost from `coordinates` to `goal`
     */
    function h(coordinates, goal) {
      const { manhattanDistance, civDistance } = jwb.utils.MapUtils;
      return civDistance(coordinates, goal);

      // return manhattanDistance(coordinates, goal);
    }

    /**
     * @param {!Node} node
     * @param {!Coordinates} start
     * @param {!Coordinates} goal
     * @return {!int} an estimate of the best cost from `start` to `goal` combining both `g` and `h`
     */
    function f(node, start, goal) {
      return g(node, start) + h(node, goal);
    }

    /**
     * http://theory.stanford.edu/~amitp/GameProgramming/ImplementationNotes.html#sketch
     *
     * @param {!Coordinates} start
     * @param {!Coordinates} goal
     * @param {!Rect} rect
     * @return {!Coordinates[]}
     */
    this.findPath = (start, goal, rect) => {
      const { randChoice } = jwb.utils.RandomUtils;

      /**
       * @type {!Node[]}
       */
      const open = [
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

        /**
         * node -> estimated cost (f)
         * @type {{node: !Node, cost: !int}[]}
         */
        const nodeCosts = open.map(node => ({ node, cost: f(node, start, goal) }))
          .sort((a, b) => b[1] - a[1]);

        const bestNode = nodeCosts[0].node;
        if (coordinatesEquals(bestNode, goal)) {
          // Done!
          const path = _traverseParents(bestNode);
          //console.log(`path = ${JSON.stringify(path)}`);
          return path;
        } else {
          /**
           * @type {{node: !Node, cost: !int}[]}
           */
          const bestNodes = nodeCosts.filter(({ node, cost }) => cost === nodeCosts[0].cost);
          /**
           * @type {!Node}
           */
          const { node: chosenNode, cost: chosenNodeCost } = randChoice(bestNodes);
          open.splice(open.indexOf(chosenNode), 1);
          closed.push(chosenNode);
          _findNeighbors(chosenNode, rect).forEach(neighbor => {
            if (closed.some(coordinates => coordinatesEquals(coordinates, neighbor))) {
              // already been seen, don't need to look at it*
            } else if (open.some(coordinates => coordinatesEquals(coordinates, neighbor))) {
              // don't need to look at it now, will look later?
            } else {
              const movementCost = tileCostCalculator(chosenNode, neighbor);
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
    };

    /**
     * @param {!Node} node
     * @return {!Coordinates[]}
     * @private
     */
    function _traverseParents(node) {
      const path = [];
      for (let currentNode = node; !!currentNode; currentNode = currentNode.parent) {
        const coordinates = { x: currentNode.x, y: currentNode.y };
        path.splice(0, 0, coordinates); // add it at the beginning of the list
      }
      return path;
    }

    /**
     * @param {!Coordinates} tile
     * @param {!Rect} rect
     * @return {!Coordinates[]}
     * @private
     */
    function _findNeighbors(tile, rect) {
      const { contains } = jwb.utils.MapUtils;

      return CARDINAL_DIRECTIONS
        .map(([dx, dy]) => ({ x: tile.x + dx, y: tile.y + dy }))
        .filter(({ x, y }) => contains(rect, { x, y }))
        .filter(({ x, y }) => !blockedTileDetector({ x, y }));
    }
  }

  jwb.Pathfinder = Pathfinder;
}
