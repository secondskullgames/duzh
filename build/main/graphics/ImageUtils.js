"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function loadImage(filename) {
    return new Promise(function (resolve, reject) {
        var canvas = document.createElement('canvas');
        canvas.style.display = 'none';
        var img = document.createElement('img');
        img.addEventListener('load', function () {
            canvas.width = img.width;
            canvas.height = img.height;
            var context = canvas.getContext('2d');
            if (!context) {
                throw 'Couldn\'t get rendering context!';
            }
            context.drawImage(img, 0, 0);
            var imageData = context.getImageData(0, 0, img.width, img.height);
            if (img.parentElement) {
                img.parentElement.removeChild(img);
            }
            if (canvas.parentElement) {
                canvas.parentElement.removeChild(canvas);
            }
            resolve(imageData);
        });
        img.style.display = 'none';
        img.onerror = function () {
            reject("Failed to load image " + img.src);
        };
        img.src = "png/" + filename + ".png";
    });
}
exports.loadImage = loadImage;
function applyTransparentColor(imageData, transparentColor) {
    return new Promise(function (resolve, reject) {
        var _a = hex2rgb(transparentColor), tr = _a[0], tg = _a[1], tb = _a[2];
        var array = new Uint8ClampedArray(imageData.data.length);
        for (var i = 0; i < imageData.data.length; i += 4) {
            // @ts-ignore
            var _b = imageData.data.slice(i, i + 4), r = _b[0], g = _b[1], b = _b[2], a = _b[3];
            array[i] = r;
            array[i + 1] = g;
            array[i + 2] = b;
            if (r === tr && g === tg && b === tb) {
                array[i + 3] = 0;
            }
            else {
                array[i + 3] = a;
            }
        }
        resolve(new ImageData(array, imageData.width, imageData.height));
    });
}
exports.applyTransparentColor = applyTransparentColor;
function replaceColors(imageData, colorMap) {
    return new Promise(function (resolve) {
        if (!colorMap) {
            resolve(imageData);
        }
        var array = new Uint8ClampedArray(imageData.data.length);
        var entries = Object.entries(colorMap);
        var srcRGB = {};
        var destRGB = {};
        entries.forEach(function (_a) {
            var srcColor = _a[0], destColor = _a[1];
            srcRGB[srcColor] = hex2rgb(srcColor);
            destRGB[destColor] = hex2rgb(destColor);
        });
        for (var i = 0; i < imageData.data.length; i += 4) {
            // @ts-ignore
            var _a = imageData.data.slice(i, i + 4), r = _a[0], g = _a[1], b = _a[2], a = _a[3];
            array[i] = r;
            array[i + 1] = g;
            array[i + 2] = b;
            array[i + 3] = a;
            for (var j = 0; j < entries.length; j++) {
                var _b = entries[j], srcColor = _b[0], destColor = _b[1];
                var _c = srcRGB[srcColor], sr = _c[0], sg = _c[1], sb = _c[2];
                var _d = destRGB[destColor], dr = _d[0], dg = _d[1], db = _d[2];
                if (r === sr && g === sg && b === sb) {
                    array[i] = dr;
                    array[i + 1] = dg;
                    array[i + 2] = db;
                    break;
                }
            }
        }
        resolve(new ImageData(array, imageData.width, imageData.height));
    });
}
exports.replaceColors = replaceColors;
/**
 * Replace all non-transparent colors with the specified `color`.
 */
function replaceAll(imageData, color) {
    return new Promise(function (resolve) {
        var _a = hex2rgb(color), dr = _a[0], dg = _a[1], db = _a[2];
        var array = new Uint8ClampedArray(imageData.data.length);
        for (var i = 0; i < imageData.data.length; i += 4) {
            // @ts-ignore
            var _b = imageData.data.slice(i, i + 4), r = _b[0], g = _b[1], b = _b[2], a = _b[3];
            array[i] = r;
            array[i + 1] = g;
            array[i + 2] = b;
            array[i + 3] = a;
            if (a > 0) {
                array[i] = dr;
                array[i + 1] = dg;
                array[i + 2] = db;
            }
        }
        resolve(new ImageData(array, imageData.width, imageData.height));
    });
}
exports.replaceAll = replaceAll;
/**
 * Convert a hex string, e.g. '#00c0ff', to its equivalent RGB values, e.g. (0, 192, 255).
 * This implementation relies on the browser automatically doing this conversion when
 * an element's `backgroundColor` value is set.
 */
function hex2rgb(hex) {
    var div = document.createElement('div');
    div.style.backgroundColor = hex;
    // @ts-ignore
    return div.style.backgroundColor
        .split(/[(),]/)
        .map(function (c) { return parseInt(c); })
        .filter(function (c) { return c != null && !isNaN(c); });
}
exports.hex2rgb = hex2rgb;
//# sourceMappingURL=ImageUtils.js.map