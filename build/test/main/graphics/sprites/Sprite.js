"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Note: It's expected that a separate Sprite instance will be created
 * per entity, and frame caching will be handled... somewhere else
 */
var Sprite = /** @class */ (function () {
    function Sprite(imageMap, key, _a) {
        var dx = _a.dx, dy = _a.dy;
        this._imageMap = imageMap;
        this.key = key;
        this.dx = dx;
        this.dy = dy;
        this.getImage();
    }
    Sprite.prototype.getImage = function () {
        var imageSupplier = this._imageMap[this.key];
        if (!imageSupplier) {
            throw "Invalid sprite key " + this.key;
        }
        return imageSupplier.get();
    };
    /**
     * This will be overridden by individual sprites to handle
     * e.g. unit-specific logic
     */
    Sprite.prototype.update = function () {
        return this.getImage();
    };
    return Sprite;
}());
exports.default = Sprite;
//# sourceMappingURL=Sprite.js.map