import { sortBy } from '../utils/ArrayUtils.js';
import { TileType } from '../types/types.js';
import { randChoice } from '../utils/RandomUtils.js';
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
            sortBy(unoccupiedLocations, function (_a) {
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
function coordinatesEquals(first, second) {
    return (first.x === second.x && first.y === second.y);
}
function contains(rect, coordinates) {
    return coordinates.x >= rect.left
        && coordinates.x < (rect.left + rect.width)
        && coordinates.y >= rect.top
        && coordinates.y < (rect.top + rect.height);
}
function manhattanDistance(first, second) {
    return Math.abs(first.x - second.x) + Math.abs(first.y - second.y);
}
function hypotenuse(first, second) {
    var dx = second.x - first.x;
    var dy = second.y - first.y;
    return Math.pow(((dx * dx) + (dy * dy)), 0.5);
}
function civDistance(first, second) {
    var dx = Math.abs(first.x - second.x);
    var dy = Math.abs(first.y - second.y);
    return Math.max(dx, dy) + Math.min(dx, dy) / 2;
}
function isAdjacent(first, second) {
    var dx = Math.abs(first.x - second.x);
    var dy = Math.abs(first.y - second.y);
    return (dx === 0 && (dy === -1 || dy === 1)) || (dy === 0 && (dx === -1 || dx === 1));
}
function isTileRevealed(_a) {
    var x = _a.x, y = _a.y;
    if (jwb.DEBUG) {
        return true;
    }
    return jwb.state.getMap().revealedTiles.some(function (tile) { return coordinatesEquals({ x: x, y: y }, tile); });
}
function isBlocking(tileType) {
    switch (tileType) {
        case TileType.FLOOR:
        case TileType.FLOOR_HALL:
        case TileType.STAIRS_DOWN:
            return false;
        default:
            return true;
    }
}
function createTile(type, tileSet) {
    return {
        type: type,
        sprite: randChoice(tileSet[type]),
        isBlocking: isBlocking(type)
    };
}
export { pickUnoccupiedLocations, civDistance, manhattanDistance, hypotenuse, contains, coordinatesEquals, isAdjacent, isTileRevealed, isBlocking, createTile };
//# sourceMappingURL=MapUtils.js.map