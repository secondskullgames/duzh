import { loadImage, applyTransparentColor, replaceColors } from './ImageUtils.js';
import { chainPromises } from '../utils/PromiseUtils.js';
var ImageSupplier = /** @class */ (function () {
    /**
     * @param effects A list of custom transformations to be applied to the image, in order
     */
    function ImageSupplier(filename, transparentColor, paletteSwaps, effects) {
        if (paletteSwaps === void 0) { paletteSwaps = {}; }
        if (effects === void 0) { effects = []; }
        this._image = null;
        this._imageSupplier = function () { return loadImage(filename)
            .then(function (imageData) { return applyTransparentColor(imageData, transparentColor); })
            .then(function (imageData) { return replaceColors(imageData, paletteSwaps); })
            // @ts-ignore
            .then(function (imageData) { return chainPromises(effects, imageData); })
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
export default ImageSupplier;
//# sourceMappingURL=ImageSupplier.js.map