"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MapUtils_1 = require("../maps/MapUtils");
var RandomUtils_1 = require("./RandomUtils");
var CARDINAL_DIRECTIONS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
/**
 * @return the exact cost of the path from `start` to `coordinates`
 */
function g(node, start) {
    return node.cost;
}
/**
 * @return the heuristic estimated cost from `coordinates` to `goal`
 */
function h(coordinates, goal) {
    // return civDistance(coordinates, goal);
    return MapUtils_1.manhattanDistance(coordinates, goal);
}
/**
 * @return an estimate of the best cost from `start` to `goal` combining both `g` and `h`
 */
function f(node, start, goal) {
    return g(node, start) + h(node, goal);
}
function traverseParents(node) {
    var path = [];
    for (var currentNode = node; !!currentNode; currentNode = currentNode.parent) {
        var coordinates = { x: currentNode.x, y: currentNode.y };
        path.splice(0, 0, coordinates); // add it at the beginning of the list
    }
    return path;
}
/**
 * http://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html
 */
var Pathfinder = /** @class */ (function () {
    /**
     * http://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html
     */
    function Pathfinder(tileCostCalculator) {
        this._tileCostCalculator = tileCostCalculator;
    }
    /**
     * http://theory.stanford.edu/~amitp/GameProgramming/ImplementationNotes.html#sketch
     *
     * @param tiles All allowable unblocked tiles
     */
    Pathfinder.prototype.findPath = function (start, goal, tiles) {
        var _this = this;
        var open = [
            { x: start.x, y: start.y, cost: 0, parent: null }
        ];
        var closed = [];
        var _loop_1 = function () {
            if (open.length === 0) {
                return { value: [] };
            }
            var nodeCosts = open.map(function (node) { return ({ node: node, cost: f(node, start, goal) }); })
                .sort(function (a, b) { return a.cost - b.cost; });
            var bestNode = nodeCosts[0].node;
            if (MapUtils_1.coordinatesEquals(bestNode, goal)) {
                return { value: traverseParents(bestNode) };
            }
            else {
                var bestNodes = nodeCosts.filter(function (_a) {
                    var node = _a.node, cost = _a.cost;
                    return cost === nodeCosts[0].cost;
                });
                var _a = RandomUtils_1.randChoice(bestNodes), chosenNode_1 = _a.node, chosenNodeCost_1 = _a.cost;
                open.splice(open.indexOf(chosenNode_1), 1);
                closed.push(chosenNode_1);
                this_1._findNeighbors(chosenNode_1, tiles).forEach(function (neighbor) {
                    if (closed.some(function (coordinates) { return MapUtils_1.coordinatesEquals(coordinates, neighbor); })) {
                        // already been seen, don't need to look at it*
                    }
                    else if (open.some(function (coordinates) { return MapUtils_1.coordinatesEquals(coordinates, neighbor); })) {
                        // don't need to look at it now, will look later?
                    }
                    else {
                        var movementCost = _this._tileCostCalculator(chosenNode_1, neighbor);
                        open.push({
                            x: neighbor.x,
                            y: neighbor.y,
                            cost: chosenNodeCost_1 + movementCost,
                            parent: chosenNode_1
                        });
                    }
                });
            }
        };
        var this_1 = this;
        while (true) {
            var state_1 = _loop_1();
            if (typeof state_1 === "object")
                return state_1.value;
        }
    };
    Pathfinder.prototype._findNeighbors = function (tile, tiles) {
        return CARDINAL_DIRECTIONS
            .map(function (_a) {
            var dx = _a[0], dy = _a[1];
            return ({ x: tile.x + dx, y: tile.y + dy });
        })
            .filter(function (_a) {
            var x = _a.x, y = _a.y;
            return tiles.some(function (tile) { return MapUtils_1.coordinatesEquals(tile, { x: x, y: y }); });
        });
    };
    return Pathfinder;
}());
exports.default = Pathfinder;
//# sourceMappingURL=Pathfinder.js.map