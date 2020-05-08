var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import DungeonGenerator from './DungeonGenerator.js';
import { TileType } from '../../types/types.js';
import { randInt } from '../../utils/RandomUtils.js';
import { coordinatesEquals, isAdjacent } from '../MapUtils.js';
import { comparing } from '../../utils/ArrayUtils.js';
var BlobDungeonGenerator = /** @class */ (function (_super) {
    __extends(BlobDungeonGenerator, _super);
    function BlobDungeonGenerator(tileSet) {
        return _super.call(this, tileSet) || this;
    }
    /**
     * Strategy:
     * Add a floor tile near the middle of the map.
     * Until the map is half-full, continue adding new tiles adjacent to existing tiles.
     * New tile placement should be random - but aim for a certain level of "snakiness",
     * where snakiness is defined as the number of tiles within N units
     * (more adjacent tiles - less snaky).
     */
    BlobDungeonGenerator.prototype.generateTiles = function (width, height) {
        var tiles = this._initTiles(width, height);
        this._placeInitialTile(width, height, tiles);
        var targetNumFloorTiles = this._getTargetNumFloorTiles(width * height);
        while (this._getFloorTiles(tiles).length < targetNumFloorTiles) {
            if (!this._addFloorTile(tiles)) {
                break;
            }
        }
        this._addWalls(tiles);
        return {
            tiles: tiles,
            width: width,
            height: height,
            rooms: []
        };
    };
    BlobDungeonGenerator.prototype._initTiles = function (width, height) {
        var tiles = [];
        for (var y = 0; y < height; y++) {
            var row = [];
            for (var x = 0; x < width; x++) {
                row.push(TileType.NONE);
            }
            tiles.push(row);
        }
        return tiles;
    };
    BlobDungeonGenerator.prototype._placeInitialTile = function (width, height, tiles) {
        var x = randInt(width * 3 / 8, width * 5 / 8);
        var y = randInt(height * 3 / 8, height * 5 / 8);
        tiles[y][x] = TileType.FLOOR;
    };
    BlobDungeonGenerator.prototype._getTargetNumFloorTiles = function (max) {
        var minRatio = 0.4;
        var maxRatio = 0.7;
        return randInt(Math.round(max * minRatio), Math.round(max * maxRatio));
    };
    BlobDungeonGenerator.prototype._getFloorTiles = function (tiles) {
        var floorTiles = [];
        for (var y = 0; y < tiles.length; y++) {
            for (var x = 0; x < tiles[y].length; x++) {
                if (tiles[y][x] === TileType.FLOOR) {
                    floorTiles.push({ x: x, y: y });
                }
            }
        }
        return floorTiles;
    };
    BlobDungeonGenerator.prototype._getEmptyTiles = function (tiles) {
        var floorTiles = [];
        for (var y = 0; y < tiles.length; y++) {
            for (var x = 0; x < tiles[y].length; x++) {
                if (tiles[y][x] === TileType.NONE) {
                    floorTiles.push({ x: x, y: y });
                }
            }
        }
        return floorTiles;
    };
    /**
     * @return whether a tile was successfully added
     */
    BlobDungeonGenerator.prototype._addFloorTile = function (tiles) {
        var _this = this;
        var floorTiles = this._getFloorTiles(tiles);
        var candidates = this._getCandidates(tiles, floorTiles)
            .sort(comparing(function (tile) { return _this._getSnakeScore(tile, tiles); }));
        if (candidates.length === 0) {
            return false;
        }
        // change these ratios to adjust the "snakiness"
        var minIndex = Math.floor((candidates.length - 1) * 0.6);
        var maxIndex = Math.floor((candidates.length - 1) * 0.8);
        var index = randInt(minIndex, maxIndex);
        var _a = candidates[index], x = _a.x, y = _a.y;
        tiles[y][x] = TileType.FLOOR;
        return true;
    };
    BlobDungeonGenerator.prototype._getCandidates = function (tiles, floorTiles) {
        var _this = this;
        return this._getEmptyTiles(tiles)
            .filter(function (_a) {
            var x = _a.x, y = _a.y;
            return y > 0;
        })
            .filter(function (_a) {
            var x = _a.x, y = _a.y;
            return _this._isLegalWallCoordinates({ x: x, y: y }, tiles);
        })
            .filter(function (_a) {
            var x = _a.x, y = _a.y;
            return floorTiles.some(function (floorTile) { return isAdjacent({ x: x, y: y }, floorTile); });
        });
    };
    BlobDungeonGenerator.prototype._isLegalWallCoordinates = function (_a, tiles) {
        var x = _a.x, y = _a.y;
        // To facilitate wall generation, disallow some specific cases:
        // 1. can't add a floor tile if there's a wall right above it, AND a floor tile right above that
        var height = tiles.length;
        var m = 3; // number of consecutive wall tiles required
        for (var n = 2; n <= m; n++) {
            if (y >= n) {
                if (this._range(y - (n - 1), y - 1).every(function (y2) { return tiles[y2][x] === TileType.NONE; })
                    && (tiles[y - n][x] === TileType.FLOOR)) {
                    return false;
                }
            }
            // 2. can't add a floor tile if there's a wall right below it, AND a floor tile right below that
            if (y <= (height - 1 - n)) {
                if (this._range(y + 1, y + (n - 1)).every(function (y2) { return tiles[y2][x] === TileType.NONE; })
                    && (tiles[y + n][x] == TileType.FLOOR)) {
                    return false;
                }
            }
            // 3. check for kitty corner floor tiles
            if (this._hasKittyCornerFloorTile({ x: x, y: y }, tiles)) {
                return false;
            }
        }
        return true;
    };
    BlobDungeonGenerator.prototype._hasKittyCornerFloorTile = function (_a, tiles) {
        var x = _a.x, y = _a.y;
        var height = tiles.length;
        var width = tiles[0].length;
        // one tile apart vertically
        for (var _i = 0, _b = [[-1, -1], [1, -1], [-1, 1], [1, 1]]; _i < _b.length; _i++) {
            var _c = _b[_i], dx = _c[0], dy = _c[1];
            var _d = [x + dx, y + dy], x2 = _d[0], y2 = _d[1];
            if (x2 < 0 || x2 >= width || y2 < 0 || y2 >= height) {
                // out of bounds
            }
            else if (tiles[y2][x2] === TileType.FLOOR) {
                if (tiles[y2][x] === TileType.NONE && tiles[y][x2] === TileType.NONE) {
                    return true;
                }
            }
        }
        // two tiles apart vertically
        // @X        ab
        // XX        cd
        //  F        ef
        for (var _e = 0, _f = [[-1, -2], [1, -2], [-1, 2], [1, 2]]; _e < _f.length; _e++) {
            var _g = _f[_e], dx = _g[0], dy = _g[1];
            var a = { x: x, y: y };
            var b = { x: x + dx, y: y };
            var c = { x: x, y: y + (dy / 2) };
            var d = { x: x + dx, y: y + (dy / 2) };
            var e = { x: x, y: y + dy };
            var f = { x: x + dx, y: y + dy };
            if (f.x < 0 || f.x >= width || f.y < 0 || f.y >= height) {
                // out of bounds
            }
            else {
                if (tiles[b.y][b.x] === TileType.NONE
                    && tiles[c.y][c.x] === TileType.NONE
                    && tiles[d.y][d.x] === TileType.NONE
                    && tiles[f.y][f.x] === TileType.FLOOR) {
                    return true;
                }
            }
        }
        return false;
    };
    BlobDungeonGenerator.prototype._addWalls = function (tiles) {
        var height = tiles.length;
        var width = tiles[0].length;
        for (var y = 0; y < (height - 1); y++) {
            for (var x = 0; x < width; x++) {
                if (tiles[y][x] === TileType.NONE && tiles[y + 1][x] === TileType.FLOOR) {
                    tiles[y][x] = TileType.WALL_TOP;
                }
            }
        }
    };
    /**
     * @param end inclusive
     */
    BlobDungeonGenerator.prototype._range = function (start, end) {
        var range = [];
        for (var i = start; i <= end; i++) {
            range.push(i);
        }
        return range;
    };
    /**
     * @return the number of nearby tiles
     */
    BlobDungeonGenerator.prototype._getSnakeScore = function (tile, tiles) {
        var score = 0;
        var offset = 1;
        var height = tiles.length;
        var width = tiles[0].length;
        var minY = Math.max(0, tile.y - offset);
        var maxY = Math.min(tile.y + offset, height - 1);
        var minX = Math.max(0, tile.x - offset);
        var maxX = Math.min(tile.x + offset, width - 1);
        for (var y = minY; y <= maxY; y++) {
            for (var x = minX; x <= maxX; x++) {
                if (coordinatesEquals(tile, { x: x, y: y })) {
                    continue;
                }
                if (tiles[y][x] === TileType.FLOOR) {
                    score++;
                }
            }
        }
        return score;
    };
    return BlobDungeonGenerator;
}(DungeonGenerator));
export default BlobDungeonGenerator;
//# sourceMappingURL=BlobDungeonGenerator.js.map