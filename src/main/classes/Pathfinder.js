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
   * @constructor
   */
  function Pathfinder(blockedTileDetector) {
    /**
     * @return {!int} the exact cost of the path from `start` to `coordinates`
     * @param {!Node} node
     * @param {!Coordinates} start
     * @return {!int}
     */
    function g(node, start) {
      return node.cost;
    }

    /**
     * @return {!int} the heuristic estimated cost from `coordinates` to `goal`
     * @param {!Coordinates} coordinates
     * @param {!Coordinates} goal
     * @return {!int}
     */
    function h(coordinates, goal) {
      const { manhattanDistance, distance } = jwb.utils.MapUtils;
      // civ distance
      //return distance(coordinates, goal);

      return manhattanDistance(coordinates, goal);
    }

    /**
     * @param {!Node} node
     * @param {!Coordinates} start
     * @param {!Coordinates} goal
     * @return {!int}
     */
    function f(node, start, goal) {
      return g(node, start) + h(node, goal);
    }

    /**
     * @param {!Coordinates} first
     * @param {!Coordinates} second
     * @return {!boolean}
     * @private
     */
    function _equals(first, second) {
      return (first.x === second.x) && (first.y === second.y);
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
          //console.error('fuck, out of open tiles');
          return [];
        }

        /**
         * @type {{node: !Node, cost: !int}[]}
         */
        const nodeCosts = open.map(node => ({ node, cost: f(node, start, goal) }))
          .sort((a, b) => b[1] - a[1]);

        const bestNode = nodeCosts[0].node;
        if (_equals(bestNode, goal)) {
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
            if (closed.some(coordinates => _equals(coordinates, neighbor))) {
              // already been seen, don't need to look at it*
            } else if (open.some(coordinates => _equals(coordinates, neighbor))) {
              // don't need to look at it now, will look later?
            } else {
              open.push({
                x: neighbor.x,
                y: neighbor.y,
                //cost: chosenNode.cost + 1, // assumes the movement cost is always 1
                cost: chosenNodeCost + 1, // assumes the movement cost is always 1
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