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
var DungeonGenerator = /** @class */ (function () {
    function DungeonGenerator(tileSet) {
        this._tileSet = tileSet;
    }
    DungeonGenerator.prototype.generateDungeon = function (level, width, height, numEnemies, enemyUnitSupplier, numItems, itemSupplier) {
        var _this = this;
        var t1 = new Date().getTime();
        var section = this.generateTiles(width, height);
        var t2 = new Date().getTime();
        var tileTypes = section.tiles;
        var stairsLocation = MapUtils_1.pickUnoccupiedLocations(tileTypes, [types_1.TileType.FLOOR], [], 1)[0];
        tileTypes[stairsLocation.y][stairsLocation.x] = types_1.TileType.STAIRS_DOWN;
        var enemyUnitLocations = MapUtils_1.pickUnoccupiedLocations(tileTypes, [types_1.TileType.FLOOR], [stairsLocation], numEnemies);
        var playerUnitLocation = this._pickPlayerLocation(tileTypes, __spreadArrays([stairsLocation], enemyUnitLocations))[0];
        var itemLocations = MapUtils_1.pickUnoccupiedLocations(tileTypes, [types_1.TileType.FLOOR], __spreadArrays([stairsLocation, playerUnitLocation], enemyUnitLocations), numItems);
        var tiles = tileTypes.map(function (row) {
            return row.map(function (tileType) { return MapUtils_1.createTile(tileType, _this._tileSet); });
        });
        var t3 = new Date().getTime();
        console.log("Generated dungeon " + level + " in " + (t3 - t1) + " (" + (t2 - t1) + ", " + (t3 - t2) + ") ms");
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
    return DungeonGenerator;
}());
exports.default = DungeonGenerator;
//# sourceMappingURL=DungeonGenerator.js.map