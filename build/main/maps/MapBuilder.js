import MapInstance from './MapInstance.js';
var MapBuilder = /** @class */ (function () {
    function MapBuilder(level, width, height, tiles, rooms, playerUnitLocation, enemyUnitLocations, enemyUnitSupplier, itemLocations, itemSupplier) {
        this._level = level;
        this._width = width;
        this._height = height;
        this._tiles = tiles;
        this._rooms = rooms;
        this._playerUnitLocation = playerUnitLocation;
        this._enemyUnitLocations = enemyUnitLocations;
        this._itemLocations = itemLocations;
        this._enemyUnitSupplier = enemyUnitSupplier;
        this._itemSupplier = itemSupplier;
    }
    MapBuilder.prototype.build = function () {
        var _a;
        var _this = this;
        var playerUnit = jwb.state.playerUnit;
        var units = [playerUnit];
        _a = [this._playerUnitLocation.x, this._playerUnitLocation.y], playerUnit.x = _a[0], playerUnit.y = _a[1];
        units.push.apply(units, this._enemyUnitLocations.map(function (_a) {
            var x = _a.x, y = _a.y;
            return _this._enemyUnitSupplier({ x: x, y: y }, _this._level);
        }));
        var items = this._itemLocations.map(function (_a) {
            var x = _a.x, y = _a.y;
            return _this._itemSupplier({ x: x, y: y }, _this._level);
        });
        return new MapInstance(this._width, this._height, this._tiles, this._rooms, units, items);
    };
    return MapBuilder;
}());
export default MapBuilder;
//# sourceMappingURL=MapBuilder.js.map