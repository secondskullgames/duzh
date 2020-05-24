"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SpriteRenderer_1 = require("./SpriteRenderer");
var Colors_1 = require("../types/Colors");
var types_1 = require("../types/types");
var MinimapRenderer = /** @class */ (function () {
    function MinimapRenderer() {
        this._canvas = document.createElement('canvas');
        this._context = this._canvas.getContext('2d');
        this._canvas.width = SpriteRenderer_1.default.SCREEN_WIDTH;
        this._canvas.height = SpriteRenderer_1.default.SCREEN_HEIGHT;
        this._context.imageSmoothingEnabled = false;
    }
    MinimapRenderer.prototype.render = function () {
        this._context.fillStyle = Colors_1.default.BLACK;
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
        var map = jwb.state.getMap();
        var m = Math.floor(Math.min(this._canvas.width / map.width, this._canvas.height / map.height));
        for (var y = 0; y < map.height; y++) {
            for (var x = 0; x < map.width; x++) {
                var tileType = map.getTile({ x: x, y: y }).type;
                var color = void 0;
                switch (tileType) {
                    case types_1.TileType.FLOOR:
                    case types_1.TileType.FLOOR_HALL:
                    case types_1.TileType.STAIRS_DOWN:
                        color = Colors_1.default.LIGHT_GRAY;
                        break;
                    case types_1.TileType.WALL:
                    case types_1.TileType.WALL_HALL:
                        color = Colors_1.default.DARK_GRAY;
                        break;
                    case types_1.TileType.NONE:
                    case types_1.TileType.WALL_TOP:
                    default:
                        color = Colors_1.default.BLACK;
                        break;
                }
                this._context.fillStyle = color;
                this._context.fillRect(x * m, y * m, m, m);
            }
        }
        var imageData = this._context.getImageData(0, 0, this._canvas.width, this._canvas.height);
        return createImageBitmap(imageData);
    };
    return MinimapRenderer;
}());
exports.default = MinimapRenderer;
//# sourceMappingURL=MinimapRenderer.js.map