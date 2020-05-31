"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var ImageSupplier_1 = require("../graphics/ImageSupplier");
var Colors_1 = require("../types/Colors");
var types_1 = require("../types/types");
var SpriteFactory_1 = require("../graphics/sprites/SpriteFactory");
function _getTileSprite(filename) {
    return function (paletteSwaps) { return SpriteFactory_1.createStaticSprite(new ImageSupplier_1.default(filename, Colors_1.default.WHITE, paletteSwaps), { dx: 0, dy: 0 }); };
}
function _mapFilenames(filenames) {
    // @ts-ignore
    var tileSet = {};
    Object.entries(filenames).forEach(function (_a) {
        var tileType = _a[0], filenames = _a[1];
        // @ts-ignore
        tileSet[tileType] = [];
        filenames.forEach(function (filename) {
            var sprite = !!filename ? _getTileSprite(filename)({}) : null;
            // @ts-ignore
            tileSet[tileType].push(sprite);
        });
    });
    return tileSet;
}
var dungeonFilenames = (_a = {},
    _a[types_1.TileType.FLOOR] = ['dungeon/tile_floor', 'dungeon/tile_floor_2'],
    _a[types_1.TileType.FLOOR_HALL] = ['dungeon/tile_floor_hall', 'dungeon/tile_floor_hall_2'],
    _a[types_1.TileType.WALL_TOP] = [null],
    _a[types_1.TileType.WALL_HALL] = ['dungeon/tile_wall_hall'],
    _a[types_1.TileType.WALL] = ['dungeon/tile_wall'],
    _a[types_1.TileType.STAIRS_DOWN] = ['stairs_down2'],
    _a[types_1.TileType.NONE] = [null],
    _a);
var caveFilenames = (_b = {},
    _b[types_1.TileType.FLOOR] = ['cave/tile_floor', 'cave/tile_floor_2'],
    _b[types_1.TileType.FLOOR_HALL] = ['cave/tile_floor', 'cave/tile_floor_2'],
    _b[types_1.TileType.WALL_TOP] = [],
    _b[types_1.TileType.WALL_HALL] = ['cave/tile_wall'],
    _b[types_1.TileType.WALL] = ['cave/tile_wall'],
    _b[types_1.TileType.STAIRS_DOWN] = ['stairs_down2'],
    _b[types_1.TileType.NONE] = [null],
    _b);
var TileSets = {
    DUNGEON: _mapFilenames(dungeonFilenames),
    CAVE: _mapFilenames(caveFilenames),
};
exports.default = TileSets;
//# sourceMappingURL=TileSets.js.map