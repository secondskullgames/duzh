import { TileType } from '../types/types.js';
var MapInstance = /** @class */ (function () {
    function MapInstance(width, height, tiles, rooms, units, items) {
        this.width = width;
        this.height = height;
        this._tiles = tiles;
        this.rooms = rooms;
        this.units = units;
        this.items = items;
        this.projectiles = [];
        this.revealedTiles = [];
    }
    MapInstance.prototype.getTile = function (_a) {
        var x = _a.x, y = _a.y;
        if (x < this.width && y < this.height) {
            return (this._tiles[y] || [])[x] || TileType.NONE;
        }
        throw "Illegal coordinates " + x + ", " + y;
    };
    MapInstance.prototype.getUnit = function (_a) {
        var x = _a.x, y = _a.y;
        return this.units.filter(function (u) { return u.x === x && u.y === y; })[0] || null;
    };
    MapInstance.prototype.getItem = function (_a) {
        var x = _a.x, y = _a.y;
        return this.items.filter(function (i) { return i.x === x && i.y === y; })[0] || null;
    };
    MapInstance.prototype.getProjectile = function (_a) {
        var x = _a.x, y = _a.y;
        return this.projectiles.filter(function (p) { return p.x === x && p.y === y; })[0] || null;
    };
    MapInstance.prototype.contains = function (_a) {
        var x = _a.x, y = _a.y;
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    };
    MapInstance.prototype.isBlocked = function (_a) {
        var x = _a.x, y = _a.y;
        if (!this.contains({ x: x, y: y })) {
            throw "(" + x + ", " + y + ") is not on the map";
        }
        return !!this.getUnit({ x: x, y: y }) || this.getTile({ x: x, y: y }).isBlocking;
    };
    MapInstance.prototype.removeUnit = function (_a) {
        var x = _a.x, y = _a.y;
        var index = this.units.findIndex(function (u) { return (u.x === x && u.y === y); });
        if (index >= 0) {
            this.units.splice(index, 1);
        }
    };
    MapInstance.prototype.removeItem = function (_a) {
        var x = _a.x, y = _a.y;
        var index = this.items.findIndex(function (i) { return (i.x === x && i.y === y); });
        if (index >= 0) {
            this.items.splice(index, 1);
        }
    };
    MapInstance.prototype.removeProjectile = function (_a) {
        var x = _a.x, y = _a.y;
        var index = this.projectiles.findIndex(function (i) { return (i.x === x && i.y === y); });
        if (index >= 0) {
            this.projectiles.splice(index, 1);
        }
    };
    MapInstance.prototype.getRect = function () {
        return {
            left: 0,
            top: 0,
            width: this.width,
            height: this.height
        };
    };
    return MapInstance;
}());
export default MapInstance;
//# sourceMappingURL=MapInstance.js.map