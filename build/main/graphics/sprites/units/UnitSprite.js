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
var ImageUtils_1 = require("../../ImageUtils");
var SpriteKey;
(function (SpriteKey) {
    SpriteKey["STANDING_N"] = "STANDING_N";
    SpriteKey["STANDING_E"] = "STANDING_E";
    SpriteKey["STANDING_S"] = "STANDING_S";
    SpriteKey["STANDING_W"] = "STANDING_W";
    SpriteKey["ATTACKING_N"] = "ATTACKING_N";
    SpriteKey["ATTACKING_E"] = "ATTACKING_E";
    SpriteKey["ATTACKING_S"] = "ATTACKING_S";
    SpriteKey["ATTACKING_W"] = "ATTACKING_W";
    SpriteKey["DAMAGED_N"] = "DAMAGED_N";
    SpriteKey["DAMAGED_E"] = "DAMAGED_E";
    SpriteKey["DAMAGED_S"] = "DAMAGED_S";
    SpriteKey["DAMAGED_W"] = "DAMAGED_W";
})(SpriteKey || (SpriteKey = {}));
var UnitSprite = /** @class */ (function (_super) {
    __extends(UnitSprite, _super);
    function UnitSprite(unit, spriteName, paletteSwaps, spriteOffsets) {
        var _a;
        var _this = this;
        var imageMap = (_a = {},
            _a[SpriteKey.STANDING_N] = new ImageSupplier_1.default(spriteName + "/" + spriteName + "_standing_N_1", Colors_1.default.WHITE, paletteSwaps),
            _a[SpriteKey.STANDING_E] = new ImageSupplier_1.default(spriteName + "/" + spriteName + "_standing_E_1", Colors_1.default.WHITE, paletteSwaps),
            _a[SpriteKey.STANDING_S] = new ImageSupplier_1.default(spriteName + "/" + spriteName + "_standing_S_1", Colors_1.default.WHITE, paletteSwaps),
            _a[SpriteKey.STANDING_W] = new ImageSupplier_1.default(spriteName + "/" + spriteName + "_standing_W_1", Colors_1.default.WHITE, paletteSwaps),
            _a[SpriteKey.ATTACKING_N] = new ImageSupplier_1.default(spriteName + "/" + spriteName + "_attacking_N_1", Colors_1.default.WHITE, paletteSwaps),
            _a[SpriteKey.ATTACKING_E] = new ImageSupplier_1.default(spriteName + "/" + spriteName + "_attacking_E_1", Colors_1.default.WHITE, paletteSwaps),
            _a[SpriteKey.ATTACKING_S] = new ImageSupplier_1.default(spriteName + "/" + spriteName + "_attacking_S_1", Colors_1.default.WHITE, paletteSwaps),
            _a[SpriteKey.ATTACKING_W] = new ImageSupplier_1.default(spriteName + "/" + spriteName + "_attacking_W_1", Colors_1.default.WHITE, paletteSwaps),
            _a[SpriteKey.DAMAGED_N] = new ImageSupplier_1.default(spriteName + "/" + spriteName + "_standing_N_1", Colors_1.default.WHITE, paletteSwaps, [function (img) { return ImageUtils_1.replaceAll(img, Colors_1.default.WHITE); }]),
            _a[SpriteKey.DAMAGED_E] = new ImageSupplier_1.default(spriteName + "/" + spriteName + "_standing_E_1", Colors_1.default.WHITE, paletteSwaps, [function (img) { return ImageUtils_1.replaceAll(img, Colors_1.default.WHITE); }]),
            _a[SpriteKey.DAMAGED_S] = new ImageSupplier_1.default(spriteName + "/" + spriteName + "_standing_S_1", Colors_1.default.WHITE, paletteSwaps, [function (img) { return ImageUtils_1.replaceAll(img, Colors_1.default.WHITE); }]),
            _a[SpriteKey.DAMAGED_W] = new ImageSupplier_1.default(spriteName + "/" + spriteName + "_standing_W_1", Colors_1.default.WHITE, paletteSwaps, [function (img) { return ImageUtils_1.replaceAll(img, Colors_1.default.WHITE); }]),
            _a);
        _this = _super.call(this, imageMap, SpriteKey.STANDING_S, spriteOffsets) || this;
        _this._unit = unit;
        return _this;
    }
    UnitSprite.prototype.update = function () {
        this.key = this._getKey();
        return this.getImage();
    };
    UnitSprite.prototype._getKey = function () {
        var direction = this._unit.direction || Directions_1.default.S;
        var key = this._unit.activity + "_" + Directions_1.default.toString(direction);
        return key;
    };
    return UnitSprite;
}(Sprite_1.default));
exports.default = UnitSprite;
//# sourceMappingURL=UnitSprite.js.map