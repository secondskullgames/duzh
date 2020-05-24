"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("../../types/types");
var MapUtils_1 = require("../MapUtils");
var TileEligibilityChecker = /** @class */ (function () {
    function TileEligibilityChecker() {
    }
    TileEligibilityChecker.prototype.isBlocked = function (_a, section, exits) {
        var x = _a.x, y = _a.y;
        // can't draw a path through an existing room or a wall
        var blockedTileTypes = [types_1.TileType.FLOOR, /*TileType.FLOOR_HALL,*/ types_1.TileType.WALL, types_1.TileType.WALL_HALL, types_1.TileType.WALL_TOP];
        if (exits.some(function (exit) { return MapUtils_1.coordinatesEquals({ x: x, y: y }, exit); })) {
            return false;
        }
        else if (section.tiles[y][x] === types_1.TileType.NONE || section.tiles[y][x] === types_1.TileType.FLOOR_HALL) {
            // skip the check if we're within 1 tile vertically of an exit
            var isNextToExit = [-2, -1, 1, 2].some(function (dy) { return (exits.some(function (exit) { return MapUtils_1.coordinatesEquals(exit, { x: x, y: y + dy }); })); });
            if (isNextToExit) {
                return false;
            }
            // can't draw tiles within 2 tiles vertically of a wall tile, or a room floor tile
            for (var _i = 0, _b = [-2, -1, 1, 2]; _i < _b.length; _i++) {
                var dy = _b[_i];
                if ((y + dy >= 0) && (y + dy < section.height)) {
                    var tile = section.tiles[y + dy][x];
                    if (blockedTileTypes.indexOf(tile) > -1) {
                        return true;
                    }
                }
            }
            return false;
        }
        else if (blockedTileTypes.indexOf(section.tiles[y][x]) > -1) {
            return true;
        }
        console.error('how\'d we get here?');
        return true;
    };
    return TileEligibilityChecker;
}());
exports.default = TileEligibilityChecker;
//# sourceMappingURL=TileEligibilityChecker.js.map