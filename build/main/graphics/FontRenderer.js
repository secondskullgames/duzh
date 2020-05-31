"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ImageUtils_1 = require("./ImageUtils");
var PromiseUtils_1 = require("../utils/PromiseUtils");
var Colors_1 = require("../types/Colors");
// Fonts are partial ASCII table consisting of the "printable characters", 32 to 126
var MIN_CHARACTER_CODE = 32; // ' '
var MAX_CHARACTER_CODE = 126; // '~'
var NUM_CHARACTERS = MAX_CHARACTER_CODE - MIN_CHARACTER_CODE + 1;
var DEFAULT_CHAR = ' ';
var CHARACTERS = (function () {
    var characters = [];
    for (var c = MIN_CHARACTER_CODE; c <= MAX_CHARACTER_CODE; c++) {
        characters.push(String.fromCodePoint(c));
    }
    return characters;
})();
var Fonts = {
    PERFECT_DOS_VGA: {
        name: 'PERFECT_DOS_VGA',
        src: 'dos_perfect_vga_9x15_2',
        width: 9,
        height: 15
    }
};
exports.Fonts = Fonts;
var FontRenderer = /** @class */ (function () {
    function FontRenderer() {
        this._loadedFonts = {};
        this._imageMemos = {};
    }
    FontRenderer.prototype.render = function (text, font, color) {
        var _this = this;
        var key = this._getMemoKey(text, font, color);
        if (!!this._imageMemos[key]) {
            return PromiseUtils_1.resolvedPromise(this._imageMemos[key]);
        }
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.width = text.length * font.width;
        canvas.height = font.height;
        return this._loadFont(font)
            .then(function (fontInstance) {
            for (var i = 0; i < text.length; i++) {
                var c = text.charAt(i);
                var x = i * font.width;
                var imageBitmap = fontInstance.imageMap[c] || fontInstance.imageMap[DEFAULT_CHAR]; // TODO hacky placeholder
                context.drawImage(imageBitmap, x, 0, font.width, font.height);
            }
            return PromiseUtils_1.resolvedPromise();
        })
            .then(function () { return PromiseUtils_1.resolvedPromise(context.getImageData(0, 0, canvas.width, canvas.height)); })
            .then(function (imageData) {
            var _a;
            return ImageUtils_1.replaceColors(imageData, (_a = {}, _a[Colors_1.default.BLACK] = color, _a));
        })
            .then(function (imageData) { return createImageBitmap(imageData); })
            .then(function (imageBitmap) { _this._imageMemos[key] = imageBitmap; return imageBitmap; });
    };
    FontRenderer.prototype._loadFont = function (definition) {
        var _this = this;
        if (this._loadedFonts[definition.name]) {
            return PromiseUtils_1.resolvedPromise(this._loadedFonts[definition.name]);
        }
        var width = NUM_CHARACTERS * definition.width;
        return ImageUtils_1.loadImage("fonts/" + definition.src)
            .then(function (imageData) { return createImageBitmap(imageData); })
            .then(function (imageBitmap) {
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = definition.height;
            var context = canvas.getContext('2d');
            context.drawImage(imageBitmap, 0, 0);
            var imageMap = {};
            var promises = [];
            CHARACTERS.forEach(function (c) {
                promises.push(_this._getCharacterData(definition, context, c.charCodeAt(0))
                    .then(function (imageData) { return createImageBitmap(imageData); })
                    .then(function (imageBitmap) {
                    imageMap[c] = imageBitmap;
                }));
            });
            return Promise.all(promises)
                .then(function () {
                var fontInstance = __assign(__assign({}, definition), { imageMap: imageMap });
                _this._loadedFonts[definition.name] = fontInstance;
                return fontInstance;
            });
        });
    };
    FontRenderer.prototype._getCharacterData = function (definition, context, char) {
        var offset = this._getCharOffset(char);
        var imageData = context.getImageData(offset * definition.width, 0, definition.width, definition.height);
        return ImageUtils_1.applyTransparentColor(imageData, Colors_1.default.WHITE);
    };
    FontRenderer.prototype._getCharOffset = function (char) {
        if (char >= MIN_CHARACTER_CODE && char <= MAX_CHARACTER_CODE) {
            return char - MIN_CHARACTER_CODE;
        }
        throw "invalid character code " + char;
    };
    FontRenderer.prototype._getMemoKey = function (text, font, color) {
        return font.name + "_" + color + "_" + text;
    };
    return FontRenderer;
}());
exports.default = FontRenderer;
//# sourceMappingURL=FontRenderer.js.map