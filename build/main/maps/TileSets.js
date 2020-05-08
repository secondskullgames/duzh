var _a, _b;
import ImageSupplier from '../graphics/ImageSupplier.js';
import Colors from '../types/Colors.js';
import { TileType } from '../types/types.js';
import { createStaticSprite } from '../graphics/sprites/SpriteFactory.js';
function _getTileSprite(filename) {
    return function (paletteSwaps) { return createStaticSprite(new ImageSupplier(filename, Colors.WHITE, paletteSwaps), { dx: 0, dy: 0 }); };
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
    _a[TileType.FLOOR] = ['dungeon/tile_floor', 'dungeon/tile_floor_2'],
    _a[TileType.FLOOR_HALL] = ['dungeon/tile_floor_hall', 'dungeon/tile_floor_hall_2'],
    _a[TileType.WALL_TOP] = ['dungeon/tile_wall'],
    _a[TileType.WALL_HALL] = ['dungeon/tile_wall_hall'],
    _a[TileType.WALL] = [null],
    _a[TileType.STAIRS_DOWN] = ['stairs_down2'],
    _a[TileType.NONE] = [null],
    _a);
var caveFilenames = (_b = {},
    _b[TileType.FLOOR] = ['cave/tile_floor', 'cave/tile_floor_2'],
    _b[TileType.FLOOR_HALL] = ['cave/tile_floor', 'cave/tile_floor_2'],
    _b[TileType.WALL_TOP] = ['cave/tile_wall'],
    _b[TileType.WALL_HALL] = ['cave/tile_wall'],
    _b[TileType.WALL] = [null],
    _b[TileType.STAIRS_DOWN] = ['stairs_down2'],
    _b[TileType.NONE] = [null],
    _b);
var TileSets = {
    DUNGEON: _mapFilenames(dungeonFilenames),
    CAVE: _mapFilenames(caveFilenames),
};
export default TileSets;
//# sourceMappingURL=TileSets.js.map