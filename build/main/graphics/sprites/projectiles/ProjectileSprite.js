"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var ImageSupplier_1 = require("../../ImageSupplier");
var Sprite_1 = require("../Sprite");
var Colors_1 = require("../../../types/Colors");
var Directions_1 = require("../../../types/Directions");
var SpriteKey;
(function (SpriteKey) {
    SpriteKey["N"] = "N";
    SpriteKey["E"] = "E";
    SpriteKey["S"] = "S";
    SpriteKey["W"] = "W";
})(SpriteKey || (SpriteKey = {}));
/**
 * Projectiles have a direction but no activity or frame numbers
 */
var ProjectileSprite = /** @class */ (function (_super) {
    __extends(ProjectileSprite, _super);
    function ProjectileSprite(direction, spriteName, paletteSwaps, spriteOffsets) {
        var _a;
        var _this = this;
        var imageMap = (_a = {},
            _a[SpriteKey.N] = new ImageSupplier_1.default(spriteName + "/" + spriteName + "_N_1", Colors_1.default.WHITE, paletteSwaps),
            _a[SpriteKey.E] = new ImageSupplier_1.default(spriteName + "/" + spriteName + "_E_1", Colors_1.default.WHITE, paletteSwaps),
            _a[SpriteKey.S] = new ImageSupplier_1.default(spriteName + "/" + spriteName + "_S_1", Colors_1.default.WHITE, paletteSwaps),
            _a[SpriteKey.W] = new ImageSupplier_1.default(spriteName + "/" + spriteName + "_W_1", Colors_1.default.WHITE, paletteSwaps),
            _a);
        _this = _super.call(this, imageMap, Directions_1.default.toString(direction), spriteOffsets) || this;
        _this._direction = direction;
        return _this;
    }
    ProjectileSprite.prototype.update = function () {
        return this.getImage();
    };
    return ProjectileSprite;
}(Sprite_1.default));
exports.default = ProjectileSprite;
//# sourceMappingURL=ProjectileSprite.js.map