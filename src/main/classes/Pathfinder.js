{
  /**
   * @typedef Node
   * @property {int!} x
   * @property {int!} y
   * @property {Node | null} parent
   * @property {int!} cost
   */

  /**
   * http://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html
   * @constructor
   */
  function Pathfinder() {
    /**
     * @return the exact cost of the path from {@code start} to {@code coordinates}
     * @param {Node!} node
     * @param {Coordinates!} start
     * @return {int!}
     */
    function g(node, start) {
      return node.cost;
    }

    /**
     * @return the heuristic estimated cost from {@code coordinates} to {@code goal}
     * @param {Coordinates!} coordinates
     * @param {Coordinates!} goal
     * @return {int!}
     */
    function h(coordinates, goal) {
      const { manhattanDistance } = jwb.utils.MapUtils;
      return manhattanDistance(coordinates, goal);
    }

    /**
     * @param {Coordinates!} coordinates
     * @param {Coordinates!} start
     * @param {Coordinates!} goal
     * @return {int!}
     */
    function f(coordinates, start, goal) {
      return g(coordinates, start) + h(coordinates, goal);
    }

    /**
     * @param {Coordinates!} first
     * @param {Coordinates!} second
     * @return {boolean!}
     * @private
     */
    function _equals(first, second) {
      return (first.x === second.x) && (first.y === second.y);
    }

    /**
     * @param {Coordinates!} start
     * @param {Coordinates!} goal
     * @param {Rect!} rect
     * @param {Coordinates[]!} blockedTiles
     * @return {Coordinates[]!}
     */
    this.findPath = (start, goal, rect, blockedTiles) => {
      // http://theory.stanford.edu/~amitp/GameProgramming/ImplementationNotes.html#sketch

      /**
       * @type {Node[]}
       */
      const open = [
        { x: start.x, y: start.y, cost: 0, parent: null }
      ];
      /**
       * @type {Coordinates[]}
       */
      const closed = [];

      while (true) {
        if (open.length === 0) {
          throw 'fuck, out of open tiles';
        }
        const bestNode = open.sort((a, b) => (f(a, start, goal) - f(b, start, goal)))[0];
        if (_equals(bestNode, goal)) {
          // Done!
          const path = _traverseParents(bestNode);
          console.log(`path = ${JSON.stringify(path)}`);
          return path;
        } else {
          open.splice(open.indexOf(bestNode), 1);
          closed.push(bestNode);
          _findNeighbors(bestNode, rect, blockedTiles).forEach(neighbor => {
            if (closed.some(coordinates => _equals(coordinates, neighbor))) {
              // already been seen, don't need to look at it*
            } else if (open.some(coordinates => _equals(coordinates, neighbor))) {
              // don't need to look at it now, will look later?
            } else {
              open.push({
                x: neighbor.x,
                y: neighbor.y,
                cost: bestNode.cost + 1, // assumes the movement cost is always 1
                parent: bestNode
              });
            }
          });
        }
      }
    };

    /**
     * @return {Coordinates[]}
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
     * @param {Coordinates!} tile
     * @param {Rect!} rect
     * @param {Coordinates[]!} blockedTiles
     * @return {Coordinates[]!}
     * @private
     */
    function _findNeighbors(tile, rect, blockedTiles) {
      const { contains } = jwb.utils.MapUtils;
      return [[0, -1], [1, 0], [0, 1], [-1, 0]]
        .map(([dx, dy]) => ({ x: tile.x + dx, y: tile.y + dy }))
        .filter(({ x, y }) => contains(rect, { x, y }))
        .filter(({ x, y }) => !blockedTiles.some(blocked => x === blocked.x && y === blocked.y));
    }
  }

  jwb.Pathfinder = Pathfinder;
}