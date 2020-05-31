"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ImageUtils_1 = require("./ImageUtils");
var PromiseUtils_1 = require("../utils/PromiseUtils");
var ImageSupplier = /** @class */ (function () {
    /**
     * @param effects A list of custom transformations to be applied to the image, in order
     */
    function ImageSupplier(filename, transparentColor, paletteSwaps, effects) {
        if (paletteSwaps === void 0) { paletteSwaps = {}; }
        if (effects === void 0) { effects = []; }
        this._image = null;
        this._imageSupplier = function () { return ImageUtils_1.loadImage(filename)
            .then(function (imageData) { return ImageUtils_1.applyTransparentColor(imageData, transparentColor); })
            .then(function (imageData) { return ImageUtils_1.replaceColors(imageData, paletteSwaps); })
            // @ts-ignore
            .then(function (imageData) { return PromiseUtils_1.chainPromises(effects, imageData); })
            .then(function (imageData) { return createImageBitmap(imageData); }); };
    }
    ImageSupplier.prototype.get = function () {
        if (!this._image) {
            this._image = this._imageSupplier();
        }
        return this._image;
    };
    return ImageSupplier;
}());
exports.default = ImageSupplier;
//# sourceMappingURL=ImageSupplier.js.map