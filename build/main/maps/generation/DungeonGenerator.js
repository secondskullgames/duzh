"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var MapBuilder_1 = require("../MapBuilder");
var types_1 = require("../../types/types");
var MapUtils_1 = require("../MapUtils");
var ArrayUtils_1 = require("../../utils/ArrayUtils");
var Pathfinder_1 = require("../../utils/Pathfinder");
var TileEligibilityChecker_1 = require("./TileEligibilityChecker");
var DungeonGenerator = /** @class */ (function () {
    function DungeonGenerator(tileSet) {
        this._tileSet = tileSet;
    }
    DungeonGenerator.prototype.generateDungeon = function (level, width, height, numEnemies, enemyUnitSupplier, numItems, itemSupplier) {
        var _this = this;
        var section;
        var isValid = false;
        var iterations = 0;
        do {
            var t1 = new Date().getTime();
            section = this.generateTiles(width, height);
            isValid = this._validateSection(section);
            var t2 = new Date().getTime();
            console.log("Generated dungeon tiles for level " + level + " in " + (t2 - t1) + " ms");
            if (!isValid) {
                console.error("Generated invalid tiles for level " + level + ", regenerating");
            }
            iterations++;
        } while (!isValid && (iterations < 100));
        var tileTypes = section.tiles;
        var stairsLocation = MapUtils_1.pickUnoccupiedLocations(tileTypes, [types_1.TileType.FLOOR], [], 1)[0];
        tileTypes[stairsLocation.y][stairsLocation.x] = types_1.TileType.STAIRS_DOWN;
        var enemyUnitLocations = MapUtils_1.pickUnoccupiedLocations(tileTypes, [types_1.TileType.FLOOR], [stairsLocation], numEnemies);
        var playerUnitLocation = this._pickPlayerLocation(tileTypes, __spreadArrays([stairsLocation], enemyUnitLocations))[0];
        var itemLocations = MapUtils_1.pickUnoccupiedLocations(tileTypes, [types_1.TileType.FLOOR], __spreadArrays([stairsLocation, playerUnitLocation], enemyUnitLocations), numItems);
        var tiles = tileTypes.map(function (row) {
            return row.map(function (tileType) { return MapUtils_1.createTile(tileType, _this._tileSet); });
        });
        return new MapBuilder_1.default(level, width, height, tiles, section.rooms, playerUnitLocation, enemyUnitLocations, enemyUnitSupplier, itemLocations, itemSupplier);
    };
    /**
     * Spawn the player at the tile that maximizes average distance from enemies and the level exit.
     */
    DungeonGenerator.prototype._pickPlayerLocation = function (tiles, blockedTiles) {
        var candidates = [];
        var _loop_1 = function (y) {
            var _loop_2 = function (x) {
                if (!MapUtils_1.isBlocking(tiles[y][x]) && !blockedTiles.some(function (tile) { return MapUtils_1.coordinatesEquals(tile, { x: x, y: y }); })) {
                    var tileDistances = blockedTiles.map(function (blockedTile) { return MapUtils_1.hypotenuse({ x: x, y: y }, blockedTile); });
                    candidates.push([{ x: x, y: y }, ArrayUtils_1.average(tileDistances)]);
                }
            };
            for (var x = 0; x < tiles[y].length; x++) {
                _loop_2(x);
            }
        };
        for (var y = 0; y < tiles.length; y++) {
            _loop_1(y);
        }
        console.assert(candidates.length > 0);
        return candidates.sort(function (a, b) { return (b[1] - a[1]); })[0];
    };
    /**
     * Verify that:
     * - all rooms can be connected
     * - wall placement is correct
     *   (all floor tiles have either another floor tile, or a wall + wall top directly above them)
     *
     * Frankly, this is a hack and it would be far better to have an algorithm which is mathematically provable
     * to generate the characteristics we want on a consistent basis.  But this is easier and should prevent regressions
     *
     * @return true if the provided `section` is valid
     */
    DungeonGenerator.prototype._validateSection = function (section) {
        return this._validateRoomConnectivity(section) && this._validateWallPlacement(section);
    };
    DungeonGenerator.prototype._validateRoomConnectivity = function (section) {
        var rooms = section.rooms;
        var roomCenters = rooms.map(function (room) { return ({
            x: Math.round(room.left + room.width) / 2,
            y: Math.round(room.top + room.height) / 2
        }); });
        var tileChecker = new TileEligibilityChecker_1.default();
        var unblockedTiles = [];
        for (var y = 0; y < section.height; y++) {
            for (var x = 0; x < section.width; x++) {
                if (!tileChecker.isBlocked({ x: x, y: y }, section, [])) {
                    unblockedTiles.push({ x: x, y: y });
                }
            }
        }
        var pathfinder = new Pathfinder_1.default(function () { return 1; });
        for (var i = 0; i < rooms.length; i++) {
            for (var j = i + 1; j < rooms.length; j++) {
                var path = pathfinder.findPath(roomCenters[i], roomCenters[j], unblockedTiles);
                if (path.length === 0) {
                    return false;
                }
            }
        }
        return true;
    };
    DungeonGenerator.prototype._validateWallPlacement = function (section) {
        var floorTypes = [types_1.TileType.FLOOR, types_1.TileType.FLOOR_HALL];
        var wallTypes = [types_1.TileType.WALL, types_1.TileType.WALL_HALL];
        for (var y = 0; y < section.height; y++) {
            for (var x = 0; x < section.width; x++) {
                var tileType = section.tiles[y][x];
                if (floorTypes.indexOf(tileType) > -1) {
                    if (y < 2) {
                        return false;
                    }
                    var oneUp = section.tiles[y - 1][x];
                    var twoUp = section.tiles[y - 2][x];
                    if (floorTypes.indexOf(oneUp) > -1) {
                        // continue
                    }
                    else if (wallTypes.indexOf(oneUp) > -1) {
                        if (twoUp !== types_1.TileType.WALL_TOP) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    };
    return DungeonGenerator;
}());
exports.default = DungeonGenerator;
//# sourceMappingURL=DungeonGenerator.js.map