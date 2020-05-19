"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ArrayUtils_1 = require("../utils/ArrayUtils");
var types_1 = require("../types/types");
var RandomUtils_1 = require("../utils/RandomUtils");
/**
 * @return `numToChoose` random points from `tiles`, whose tile is in `allowedTileTypes`,
 *         which do not collide with `occupiedLocations`
 */
function pickUnoccupiedLocations(tiles, allowedTileTypes, occupiedLocations, numToChoose) {
    var unoccupiedLocations = [];
    var _loop_1 = function (y) {
        var _loop_2 = function (x) {
            if (allowedTileTypes.indexOf(tiles[y][x]) !== -1) {
                if (occupiedLocations.filter(function (loc) { return coordinatesEquals(loc, { x: x, y: y }); }).length === 0) {
                    unoccupiedLocations.push({ x: x, y: y });
                }
            }
        };
        for (var x = 0; x < tiles[y].length; x++) {
            _loop_2(x);
        }
    };
    for (var y = 0; y < tiles.length; y++) {
        _loop_1(y);
    }
    var chosenLocations = [];
    for (var i = 0; i < numToChoose; i++) {
        if (unoccupiedLocations.length > 0) {
            ArrayUtils_1.sortBy(unoccupiedLocations, function (_a) {
                var x = _a.x, y = _a.y;
                return -1 * Math.min.apply(Math, chosenLocations.map(function (loc) { return hypotenuse(loc, { x: x, y: y }); }));
            });
            var index = 0;
            var _a = unoccupiedLocations[index], x = _a.x, y = _a.y;
            chosenLocations.push({ x: x, y: y });
            occupiedLocations.push({ x: x, y: y });
            unoccupiedLocations.splice(index, 1);
        }
    }
    return chosenLocations;
}
exports.pickUnoccupiedLocations = pickUnoccupiedLocations;
function coordinatesEquals(first, second) {
    return (first.x === second.x && first.y === second.y);
}
exports.coordinatesEquals = coordinatesEquals;
function contains(rect, coordinates) {
    return coordinates.x >= rect.left
        && coordinates.x < (rect.left + rect.width)
        && coordinates.y >= rect.top
        && coordinates.y < (rect.top + rect.height);
}
exports.contains = contains;
function manhattanDistance(first, second) {
    return Math.abs(first.x - second.x) + Math.abs(first.y - second.y);
}
exports.manhattanDistance = manhattanDistance;
function hypotenuse(first, second) {
    var dx = second.x - first.x;
    var dy = second.y - first.y;
    return Math.pow(((dx * dx) + (dy * dy)), 0.5);
}
exports.hypotenuse = hypotenuse;
function civDistance(first, second) {
    var dx = Math.abs(first.x - second.x);
    var dy = Math.abs(first.y - second.y);
    return Math.max(dx, dy) + Math.min(dx, dy) / 2;
}
exports.civDistance = civDistance;
function isAdjacent(first, second) {
    var dx = Math.abs(first.x - second.x);
    var dy = Math.abs(first.y - second.y);
    return (dx === 0 && (dy === -1 || dy === 1)) || (dy === 0 && (dx === -1 || dx === 1));
}
exports.isAdjacent = isAdjacent;
function isTileRevealed(_a) {
    var x = _a.x, y = _a.y;
    if (jwb.DEBUG) {
        return true;
    }
    return jwb.state.getMap().revealedTiles.some(function (tile) { return coordinatesEquals({ x: x, y: y }, tile); });
}
exports.isTileRevealed = isTileRevealed;
function isBlocking(tileType) {
    switch (tileType) {
        case types_1.TileType.FLOOR:
        case types_1.TileType.FLOOR_HALL:
        case types_1.TileType.STAIRS_DOWN:
            return false;
        default:
            return true;
    }
}
exports.isBlocking = isBlocking;
function createTile(type, tileSet) {
    return {
        type: type,
        sprite: RandomUtils_1.randChoice(tileSet[type]),
        isBlocking: isBlocking(type)
    };
}
exports.createTile = createTile;
function areAdjacent(first, second, minBorderLength) {
    // right-left
    if (first.left + first.width === second.left) {
        var top_1 = Math.max(first.top, second.top);
        var bottom = Math.min(first.top + first.height, second.top + second.height); // exclusive
        return (bottom - top_1) >= minBorderLength;
    }
    // bottom-top
    if (first.top + first.height === second.top) {
        var left = Math.max(first.left, second.left);
        var right = Math.min(first.left + first.width, second.left + second.width); // exclusive
        return (right - left) >= minBorderLength;
    }
    // left-right
    if (first.left === second.left + second.width) {
        var top_2 = Math.max(first.top, second.top);
        var bottom = Math.min(first.top + first.height, second.top + second.height); // exclusive
        return (bottom - top_2) >= minBorderLength;
    }
    // top-bottom
    if (first.top === second.top + second.height) {
        var left = Math.max(first.left, second.left);
        var right = Math.min(first.left + first.width, second.left + second.width); // exclusive
        return (right - left) >= minBorderLength;
    }
    return false;
}
exports.areAdjacent = areAdjacent;
//# sourceMappingURL=MapUtils.js.map