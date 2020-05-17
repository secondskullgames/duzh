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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
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
define("types/Colors", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Colors;
    (function (Colors) {
        // Original 16 MS Paint colors from Will
        Colors["BLACK"] = "#000000";
        Colors["WHITE"] = "#FFFFFF";
        Colors["DARK_GRAY"] = "#808080";
        Colors["LIGHT_GRAY"] = "#C0C0C0";
        Colors["DARK_RED"] = "#800000";
        Colors["RED"] = "#FF0000";
        Colors["DARK_YELLOW"] = "#808000";
        Colors["YELLOW"] = "#FFFF00";
        Colors["DARK_GREEN"] = "#008000";
        Colors["GREEN"] = "#00FF00";
        Colors["DARK_TEAL"] = "#004040";
        Colors["CYAN"] = "#00FFFF";
        Colors["DARK_BLUE"] = "#000080";
        Colors["BLUE"] = "#0000FF";
        Colors["DARK_PURPLE"] = "#800080";
        Colors["MAGENTA"] = "#FF00FF";
        // some extended colors
        Colors["DARK_BROWN"] = "#804000";
        Colors["LIGHT_BROWN"] = "#c08040";
        Colors["ORANGE"] = "#ff8040";
        Colors["LIGHT_PINK"] = "#ffc0c0";
        Colors["MEDIUM_RED"] = "#c00000";
        Colors["MEDIUM_BLUE"] = "#0000c0";
        Colors["DARKER_GRAY"] = "#404040";
        Colors["TEAL"] = "#008080";
    })(Colors || (Colors = {}));
    exports.default = Colors;
});
define("types/types", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Activity;
    (function (Activity) {
        Activity["STANDING"] = "STANDING";
        Activity["WALKING"] = "WALKING";
        Activity["ATTACKING"] = "ATTACKING";
        Activity["DAMAGED"] = "DAMAGED";
    })(Activity || (Activity = {}));
    exports.Activity = Activity;
    var EquipmentSlot;
    (function (EquipmentSlot) {
        EquipmentSlot["MELEE_WEAPON"] = "MELEE_WEAPON";
        EquipmentSlot["RANGED_WEAPON"] = "RANGED_WEAPON";
        EquipmentSlot["ARMOR"] = "ARMOR";
    })(EquipmentSlot || (EquipmentSlot = {}));
    exports.EquipmentSlot = EquipmentSlot;
    var GameScreen;
    (function (GameScreen) {
        GameScreen["GAME"] = "GAME";
        GameScreen["INVENTORY"] = "INVENTORY";
        GameScreen["TITLE"] = "TITLE";
        GameScreen["VICTORY"] = "VICTORY";
        GameScreen["GAME_OVER"] = "GAME_OVER";
    })(GameScreen || (GameScreen = {}));
    exports.GameScreen = GameScreen;
    var ItemCategory;
    (function (ItemCategory) {
        ItemCategory["POTION"] = "POTION";
        ItemCategory["SCROLL"] = "SCROLL";
        ItemCategory["WEAPON"] = "WEAPON";
    })(ItemCategory || (ItemCategory = {}));
    exports.ItemCategory = ItemCategory;
    var MapLayout;
    (function (MapLayout) {
        MapLayout["ROOMS_AND_CORRIDORS"] = "ROOMS_AND_CORRIDORS";
        MapLayout["BLOB"] = "BLOB";
    })(MapLayout || (MapLayout = {}));
    exports.MapLayout = MapLayout;
    var TileType;
    (function (TileType) {
        TileType[TileType["FLOOR"] = 0] = "FLOOR";
        TileType[TileType["FLOOR_HALL"] = 1] = "FLOOR_HALL";
        TileType[TileType["WALL_TOP"] = 2] = "WALL_TOP";
        TileType[TileType["WALL_HALL"] = 3] = "WALL_HALL";
        TileType[TileType["WALL"] = 4] = "WALL";
        TileType[TileType["NONE"] = 5] = "NONE";
        TileType[TileType["STAIRS_DOWN"] = 6] = "STAIRS_DOWN";
    })(TileType || (TileType = {}));
    exports.TileType = TileType;
    var UnitType;
    (function (UnitType) {
        UnitType["HUMAN"] = "HUMAN";
        UnitType["ELEMENTAL"] = "ELEMENTAL";
        UnitType["GHOST"] = "GHOST";
        UnitType["GOLEM"] = "GOLEM";
        UnitType["WIZARD"] = "WIZARD";
        UnitType["ANIMAL"] = "ANIMAL";
    })(UnitType || (UnitType = {}));
    exports.UnitType = UnitType;
});
define("graphics/ImageUtils", ["require", "exports"], function (require, exports) {
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
});
define("utils/PromiseUtils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function resolvedPromise(value) {
        return new Promise(function (resolve) { return resolve(value); });
    }
    exports.resolvedPromise = resolvedPromise;
    function chainPromises(_a, input) {
        var first = _a[0], rest = _a.slice(1);
        if (!!first) {
            return first(input).then(function (output) { return chainPromises(rest, output); });
        }
        return resolvedPromise(input);
    }
    exports.chainPromises = chainPromises;
    function wait(milliseconds) {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve();
            }, milliseconds);
        });
    }
    exports.wait = wait;
});
define("graphics/ImageSupplier", ["require", "exports", "graphics/ImageUtils", "utils/PromiseUtils"], function (require, exports, ImageUtils_1, PromiseUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
});
define("graphics/sprites/Sprite", ["require", "exports"], function (require, exports) {
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
});
define("utils/ArrayUtils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function sortBy(list, mapFunction) {
        return list.sort(function (a, b) { return mapFunction(a) - mapFunction(b); });
    }
    exports.sortBy = sortBy;
    function sortByReversed(list, mapFunction) {
        return list.sort(function (a, b) { return mapFunction(b) - mapFunction(a); });
    }
    exports.sortByReversed = sortByReversed;
    function comparing(mapFunction) {
        return function (a, b) { return mapFunction(a) - mapFunction(b); };
    }
    exports.comparing = comparing;
    function comparingReversed(mapFunction) {
        return function (a, b) { return mapFunction(b) - mapFunction(a); };
    }
    exports.comparingReversed = comparingReversed;
    function average(list) {
        var sum = list.reduce(function (a, b) { return a + b; });
        return sum / list.length;
    }
    exports.average = average;
});
define("utils/RandomUtils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @param max inclusive
     */
    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    exports.randInt = randInt;
    function randChoice(list) {
        return list[randInt(0, list.length - 1)];
    }
    exports.randChoice = randChoice;
    /**
     * Fisher-Yates.  Stolen from https://bost.ocks.org/mike/shuffle/
     */
    function shuffle(list) {
        var n = list.length;
        // While there remain elements to shuffle...
        while (n > 0) {
            // Pick a remaining element...
            var i = randInt(0, n - 1);
            n--;
            // And swap it with the current element.
            var tmp = list[n];
            list[n] = list[i];
            list[i] = tmp;
        }
    }
    exports.shuffle = shuffle;
    function weightedRandom(probabilities, mappedObjects) {
        var total = Object.values(probabilities).reduce(function (a, b) { return a + b; });
        var rand = Math.random() * total;
        var counter = 0;
        var entries = Object.entries(probabilities);
        for (var i = 0; i < entries.length; i++) {
            var _a = entries[i], key = _a[0], value = _a[1];
            counter += value;
            if (counter > rand) {
                return mappedObjects[key];
            }
        }
        throw 'Error in weightedRandom()!';
    }
    exports.weightedRandom = weightedRandom;
});
define("maps/MapUtils", ["require", "exports", "utils/ArrayUtils", "types/types", "utils/RandomUtils"], function (require, exports, ArrayUtils_1, types_1, RandomUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @return `numToChoose` random points from `tiles`, whose tile is in `allowedTileTypes`,
     *         which do not collide with `occupiedLocations`
     */
    function pickUnoccupiedLocations(tiles, allowedTileTypes, occupiedLocations, numToChoose) {
        var unoccupiedLocations = [];
        var _loop_1 = function (y) {
            var _loop_2 = function (x) {
                if (allowedTileTypes.indexOf(tiles[y][x]) !== -1) {
                    if (occupiedLocations.filter(function (loc) { return coordinatesEquals(loc, { x: x, y: y }); }).length === 0) {
                        unoccupiedLocations.push({ x: x, y: y });
                    }
                }
            };
            for (var x = 0; x < tiles[y].length; x++) {
                _loop_2(x);
            }
        };
        for (var y = 0; y < tiles.length; y++) {
            _loop_1(y);
        }
        var chosenLocations = [];
        for (var i = 0; i < numToChoose; i++) {
            if (unoccupiedLocations.length > 0) {
                ArrayUtils_1.sortBy(unoccupiedLocations, function (_a) {
                    var x = _a.x, y = _a.y;
                    return -1 * Math.min.apply(Math, chosenLocations.map(function (loc) { return hypotenuse(loc, { x: x, y: y }); }));
                });
                var index = 0;
                var _a = unoccupiedLocations[index], x = _a.x, y = _a.y;
                chosenLocations.push({ x: x, y: y });
                occupiedLocations.push({ x: x, y: y });
                unoccupiedLocations.splice(index, 1);
            }
        }
        return chosenLocations;
    }
    exports.pickUnoccupiedLocations = pickUnoccupiedLocations;
    function coordinatesEquals(first, second) {
        return (first.x === second.x && first.y === second.y);
    }
    exports.coordinatesEquals = coordinatesEquals;
    function contains(rect, coordinates) {
        return coordinates.x >= rect.left
            && coordinates.x < (rect.left + rect.width)
            && coordinates.y >= rect.top
            && coordinates.y < (rect.top + rect.height);
    }
    exports.contains = contains;
    function manhattanDistance(first, second) {
        return Math.abs(first.x - second.x) + Math.abs(first.y - second.y);
    }
    exports.manhattanDistance = manhattanDistance;
    function hypotenuse(first, second) {
        var dx = second.x - first.x;
        var dy = second.y - first.y;
        return Math.pow(((dx * dx) + (dy * dy)), 0.5);
    }
    exports.hypotenuse = hypotenuse;
    function civDistance(first, second) {
        var dx = Math.abs(first.x - second.x);
        var dy = Math.abs(first.y - second.y);
        return Math.max(dx, dy) + Math.min(dx, dy) / 2;
    }
    exports.civDistance = civDistance;
    function isAdjacent(first, second) {
        var dx = Math.abs(first.x - second.x);
        var dy = Math.abs(first.y - second.y);
        return (dx === 0 && (dy === -1 || dy === 1)) || (dy === 0 && (dx === -1 || dx === 1));
    }
    exports.isAdjacent = isAdjacent;
    function isTileRevealed(_a) {
        var x = _a.x, y = _a.y;
        if (jwb.DEBUG) {
            return true;
        }
        return jwb.state.getMap().revealedTiles.some(function (tile) { return coordinatesEquals({ x: x, y: y }, tile); });
    }
    exports.isTileRevealed = isTileRevealed;
    function isBlocking(tileType) {
        switch (tileType) {
            case types_1.TileType.FLOOR:
            case types_1.TileType.FLOOR_HALL:
            case types_1.TileType.STAIRS_DOWN:
                return false;
            default:
                return true;
        }
    }
    exports.isBlocking = isBlocking;
    function createTile(type, tileSet) {
        return {
            type: type,
            sprite: RandomUtils_1.randChoice(tileSet[type]),
            isBlocking: isBlocking(type)
        };
    }
    exports.createTile = createTile;
    function areAdjacent(first, second, minBorderLength) {
        // right-left
        if (first.left + first.width === second.left) {
            var top_1 = Math.max(first.top, second.top);
            var bottom = Math.min(first.top + first.height, second.top + second.height); // exclusive
            return (bottom - top_1) >= minBorderLength;
        }
        // bottom-top
        if (first.top + first.height === second.top) {
            var left = Math.max(first.left, second.left);
            var right = Math.min(first.left + first.width, second.left + second.width); // exclusive
            return (right - left) >= minBorderLength;
        }
        // left-right
        if (first.left === second.left + second.width) {
            var top_2 = Math.max(first.top, second.top);
            var bottom = Math.min(first.top + first.height, second.top + second.height); // exclusive
            return (bottom - top_2) >= minBorderLength;
        }
        // top-bottom
        if (first.top === second.top + second.height) {
            var left = Math.max(first.left, second.left);
            var right = Math.min(first.left + first.width, second.left + second.width); // exclusive
            return (right - left) >= minBorderLength;
        }
        return false;
    }
    exports.areAdjacent = areAdjacent;
});
define("utils/Pathfinder", ["require", "exports", "maps/MapUtils", "utils/RandomUtils"], function (require, exports, MapUtils_1, RandomUtils_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CARDINAL_DIRECTIONS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    /**
     * @return the exact cost of the path from `start` to `coordinates`
     */
    function g(node, start) {
        return node.cost;
    }
    /**
     * @return the heuristic estimated cost from `coordinates` to `goal`
     */
    function h(coordinates, goal) {
        // return civDistance(coordinates, goal);
        return MapUtils_1.manhattanDistance(coordinates, goal);
    }
    /**
     * @return an estimate of the best cost from `start` to `goal` combining both `g` and `h`
     */
    function f(node, start, goal) {
        return g(node, start) + h(node, goal);
    }
    function traverseParents(node) {
        var path = [];
        for (var currentNode = node; !!currentNode; currentNode = currentNode.parent) {
            var coordinates = { x: currentNode.x, y: currentNode.y };
            path.splice(0, 0, coordinates); // add it at the beginning of the list
        }
        return path;
    }
    /**
     * http://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html
     */
    var Pathfinder = /** @class */ (function () {
        /**
         * http://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html
         */
        function Pathfinder(tileCostCalculator) {
            this._tileCostCalculator = tileCostCalculator;
        }
        /**
         * http://theory.stanford.edu/~amitp/GameProgramming/ImplementationNotes.html#sketch
         *
         * @param tiles All allowable unblocked tiles
         */
        Pathfinder.prototype.findPath = function (start, goal, tiles) {
            var _this = this;
            var open = [
                { x: start.x, y: start.y, cost: 0, parent: null }
            ];
            var closed = [];
            var _loop_3 = function () {
                if (open.length === 0) {
                    return { value: [] };
                }
                var nodeCosts = open.map(function (node) { return ({ node: node, cost: f(node, start, goal) }); })
                    .sort(function (a, b) { return a.cost - b.cost; });
                var bestNode = nodeCosts[0].node;
                if (MapUtils_1.coordinatesEquals(bestNode, goal)) {
                    return { value: traverseParents(bestNode) };
                }
                else {
                    var bestNodes = nodeCosts.filter(function (_a) {
                        var node = _a.node, cost = _a.cost;
                        return cost === nodeCosts[0].cost;
                    });
                    var _a = RandomUtils_2.randChoice(bestNodes), chosenNode_1 = _a.node, chosenNodeCost_1 = _a.cost;
                    open.splice(open.indexOf(chosenNode_1), 1);
                    closed.push(chosenNode_1);
                    this_1._findNeighbors(chosenNode_1, tiles).forEach(function (neighbor) {
                        if (closed.some(function (coordinates) { return MapUtils_1.coordinatesEquals(coordinates, neighbor); })) {
                            // already been seen, don't need to look at it*
                        }
                        else if (open.some(function (coordinates) { return MapUtils_1.coordinatesEquals(coordinates, neighbor); })) {
                            // don't need to look at it now, will look later?
                        }
                        else {
                            var movementCost = _this._tileCostCalculator(chosenNode_1, neighbor);
                            open.push({
                                x: neighbor.x,
                                y: neighbor.y,
                                cost: chosenNodeCost_1 + movementCost,
                                parent: chosenNode_1
                            });
                        }
                    });
                }
            };
            var this_1 = this;
            while (true) {
                var state_1 = _loop_3();
                if (typeof state_1 === "object")
                    return state_1.value;
            }
        };
        Pathfinder.prototype._findNeighbors = function (tile, tiles) {
            return CARDINAL_DIRECTIONS
                .map(function (_a) {
                var dx = _a[0], dy = _a[1];
                return ({ x: tile.x + dx, y: tile.y + dy });
            })
                .filter(function (_a) {
                var x = _a.x, y = _a.y;
                return tiles.some(function (tile) { return MapUtils_1.coordinatesEquals(tile, { x: x, y: y }); });
            });
        };
        return Pathfinder;
    }());
    exports.default = Pathfinder;
});
define("sounds/Sounds", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Sounds = {
        PLAYER_HITS_ENEMY: [[175, 5], [0, 5], [150, 5], [0, 5], [300, 5], [0, 5], [125, 5], [0, 5], [350, 5], [0, 10], [100, 5], [0, 10], [350, 5], [0, 10], [125, 5], [0, 10], [300, 5], [0, 15], [150, 5], [0, 15], [175, 5], [0, 20], [150, 5], [0, 20], [125, 5], [0, 25], [100, 5], [1, 25], [100, 5]],
        ENEMY_HITS_PLAYER: [[100, 5], [0, 5], [125, 5], [0, 5], [300, 5], [0, 5], [150, 5], [0, 5], [350, 5], [0, 10], [175, 5], [0, 10], [350, 5], [0, 10], [150, 5], [0, 10], [300, 5], [0, 15], [125, 5], [0, 15], [175, 5], [0, 20], [100, 5], [0, 20], [125, 5], [0, 25], [100, 5], [1, 25], [100, 5]],
        ENEMY_DIES: [[20, 20], [0, 10], [30, 20], [0, 10], [25, 20], [0, 10], [25, 20], [0, 5], [40, 20], [0, 5], [35, 20], [0, 5], [45, 20], [0, 5], [25, 20], [0, 10], [35, 20], [0, 10], [25, 20], [0, 10], [30, 20], [0, 20], [40, 10], [0, 20], [35, 10], [0, 20], [45, 10], [0, 20], [25, 5], [0, 30], [35, 5], [0, 30], [20, 5], [0, 30], [30, 5]],
        PLAYER_DIES: [[30, 20], [0, 10], [40, 20], [0, 10], [25, 20], [0, 10], [35, 20], [0, 5], [80, 20], [0, 5], [45, 20], [0, 5], [115, 20], [0, 5], [35, 20], [0, 10], [75, 20], [0, 10], [25, 20], [0, 10], [60, 20], [0, 20], [50, 10], [0, 20], [65, 10], [0, 20], [55, 10], [0, 20], [35, 5], [0, 30], [45, 5], [0, 30], [30, 5], [0, 30], [40, 5]],
        LEVEL_UP: [[1000, 50], [800, 50], [600, 50], [400, 50], [200, 100], [100, 100], [50, 150], [150, 150], [250, 200], [500, 500]],
        DEFLECTED_HIT: [[400, 10], [0, 10], [500, 15], [0, 5], [400, 10], [0, 5], [400, 10], [0, 10], [100, 10], [0, 15], [200, 5]],
        PICK_UP_ITEM: [[50, 50], [0, 5], [100, 50], [0, 10], [200, 50], [0, 20], [400, 50]],
        USE_POTION: [[150, 50], [200, 50], [250, 50], [175, 50], [225, 50], [275, 50], [200, 50], [250, 50], [300, 50]],
        OPEN_DOOR: [[25, 40], [50, 40], [75, 60], [100, 60], [125, 80], [100, 80]],
        FOOTSTEP: [[10, 10], [0, 5], [50, 10], [0, 10], [10, 10], [0, 15], [50, 10], [0, 20], [10, 10]],
        DESCEND_STAIRS: [[30, 10], [0, 5], [80, 10], [0, 10], [30, 10], [0, 175], [25, 10], [0, 5], [75, 10], [0, 10], [25, 10], [0, 175], [20, 10], [0, 5], [70, 10], [0, 10], [20, 10], [0, 175], [15, 10], [0, 5], [65, 10], [0, 10], [15, 10], [0, 175], [10, 10], [0, 5], [60, 10], [0, 10], [10, 10]]
    };
    exports.default = Sounds;
});
define("sounds/types", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("sounds/CustomOscillator", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CustomOscillator = /** @class */ (function () {
        function CustomOscillator(context, gainNode, repeating) {
            this._delegate = context.createOscillator();
            this._delegate.type = 'square';
            this._delegate.connect(gainNode);
            this._isComplete = false;
            this._isRepeating = repeating;
        }
        CustomOscillator.prototype.play = function (samples, context) {
            var _this = this;
            if (samples.length) {
                var startTime = context.currentTime;
                var nextStartTime = startTime;
                for (var i = 0; i < samples.length; i++) {
                    var _a = samples[i], freq = _a[0], ms = _a[1];
                    this._delegate.frequency.setValueAtTime(freq, nextStartTime);
                    nextStartTime += ms / 1000;
                }
                var runtime = samples.map(function (_a) {
                    var freq = _a[0], ms = _a[1];
                    return ms;
                }).reduce(function (a, b) { return a + b; });
                this._delegate.start();
                this._delegate.onended = function () {
                    if (_this._isRepeating && !_this._isComplete) {
                        _this.play(samples, context);
                    }
                    else {
                        _this._isComplete = true;
                    }
                };
                this._delegate.stop(startTime + runtime / 1000);
            }
        };
        CustomOscillator.prototype.isComplete = function () {
            return this._isComplete;
        };
        CustomOscillator.prototype.stop = function () {
            this._delegate.stop(0);
            this._isComplete = true;
        };
        return CustomOscillator;
    }());
    exports.default = CustomOscillator;
});
define("sounds/SoundPlayer", ["require", "exports", "sounds/CustomOscillator"], function (require, exports, CustomOscillator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SoundPlayer = /** @class */ (function () {
        function SoundPlayer(maxPolyphony, gain) {
            this._context = new AudioContext();
            this._gainNode = this._context.createGain();
            this._gainNode.gain.value = gain * 0.2; // sounds can be VERY loud
            this._gainNode.connect(this._context.destination);
            this._oscillators = [];
        }
        SoundPlayer.prototype.stop = function () {
            try {
                this._oscillators.forEach(function (oscillator) { return oscillator.stop(); });
            }
            catch (e) {
                console.error(e);
            }
        };
        ;
        SoundPlayer.prototype.playSound = function (samples, repeating) {
            if (repeating === void 0) { repeating = false; }
            var oscillator = new CustomOscillator_1.default(this._context, this._gainNode, repeating);
            oscillator.play(samples, this._context);
            this._oscillators.push(oscillator);
            this._cleanup();
        };
        ;
        SoundPlayer.prototype._cleanup = function () {
            this._oscillators = this._oscillators.filter(function (o) { return !o.isComplete(); });
        };
        return SoundPlayer;
    }());
    exports.default = SoundPlayer;
});
define("sounds/SoundFX", ["require", "exports", "sounds/SoundPlayer"], function (require, exports, SoundPlayer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // TODO very hacky memoizing
    var PLAYER = null;
    function _getSoundPlayer() {
        return new SoundPlayer_1.default(4, 0.20);
    }
    function playSound(samples) {
        if (!PLAYER) {
            PLAYER = _getSoundPlayer();
        }
        PLAYER.playSound(samples, false);
    }
    exports.playSound = playSound;
});
define("types/Directions", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Directions = {
        N: { dx: 0, dy: -1 },
        E: { dx: 1, dy: 0 },
        S: { dx: 0, dy: 1 },
        W: { dx: -1, dy: 0 }
    };
    function _equals(first, second) {
        return first.dx === second.dx && first.dy === second.dy;
    }
    function _directionToString(direction) {
        if (_equals(direction, Directions.N)) {
            return 'N';
        }
        else if (_equals(direction, Directions.E)) {
            return 'E';
        }
        else if (_equals(direction, Directions.S)) {
            return 'S';
        }
        else if (_equals(direction, Directions.W)) {
            return 'W';
        }
        throw "Invalid direction " + direction;
    }
    exports.default = {
        N: Directions.N,
        E: Directions.E,
        S: Directions.S,
        W: Directions.W,
        values: function () { return [Directions.N, Directions.E, Directions.S, Directions.W]; },
        toString: _directionToString
    };
});
define("graphics/sprites/units/UnitSprite", ["require", "exports", "graphics/ImageSupplier", "graphics/sprites/Sprite", "types/Colors", "types/Directions", "graphics/ImageUtils"], function (require, exports, ImageSupplier_1, Sprite_1, Colors_1, Directions_1, ImageUtils_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
                _a[SpriteKey.DAMAGED_N] = new ImageSupplier_1.default(spriteName + "/" + spriteName + "_standing_N_1", Colors_1.default.WHITE, paletteSwaps, [function (img) { return ImageUtils_2.replaceAll(img, Colors_1.default.WHITE); }]),
                _a[SpriteKey.DAMAGED_E] = new ImageSupplier_1.default(spriteName + "/" + spriteName + "_standing_E_1", Colors_1.default.WHITE, paletteSwaps, [function (img) { return ImageUtils_2.replaceAll(img, Colors_1.default.WHITE); }]),
                _a[SpriteKey.DAMAGED_S] = new ImageSupplier_1.default(spriteName + "/" + spriteName + "_standing_S_1", Colors_1.default.WHITE, paletteSwaps, [function (img) { return ImageUtils_2.replaceAll(img, Colors_1.default.WHITE); }]),
                _a[SpriteKey.DAMAGED_W] = new ImageSupplier_1.default(spriteName + "/" + spriteName + "_standing_W_1", Colors_1.default.WHITE, paletteSwaps, [function (img) { return ImageUtils_2.replaceAll(img, Colors_1.default.WHITE); }]),
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
});
define("graphics/sprites/units/PlayerSprite", ["require", "exports", "graphics/sprites/units/UnitSprite"], function (require, exports, UnitSprite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PlayerSprite = /** @class */ (function (_super) {
        __extends(PlayerSprite, _super);
        function PlayerSprite(unit, paletteSwaps) {
            return _super.call(this, unit, 'player', paletteSwaps, { dx: -4, dy: -20 }) || this;
        }
        return PlayerSprite;
    }(UnitSprite_1.default));
    exports.default = PlayerSprite;
});
define("graphics/sprites/units/GolemSprite", ["require", "exports", "graphics/sprites/units/UnitSprite"], function (require, exports, UnitSprite_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GolemSprite = /** @class */ (function (_super) {
        __extends(GolemSprite, _super);
        function GolemSprite(unit, paletteSwaps) {
            return _super.call(this, unit, 'golem', paletteSwaps, { dx: -4, dy: -20 }) || this;
        }
        return GolemSprite;
    }(UnitSprite_2.default));
    exports.default = GolemSprite;
});
define("graphics/sprites/units/GruntSprite", ["require", "exports", "graphics/sprites/units/UnitSprite"], function (require, exports, UnitSprite_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GruntSprite = /** @class */ (function (_super) {
        __extends(GruntSprite, _super);
        function GruntSprite(unit, paletteSwaps) {
            return _super.call(this, unit, 'grunt', paletteSwaps, { dx: -4, dy: -20 }) || this;
        }
        return GruntSprite;
    }(UnitSprite_3.default));
    exports.default = GruntSprite;
});
define("graphics/sprites/units/SnakeSprite", ["require", "exports", "graphics/sprites/units/UnitSprite"], function (require, exports, UnitSprite_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SnakeSprite = /** @class */ (function (_super) {
        __extends(SnakeSprite, _super);
        function SnakeSprite(unit, paletteSwaps) {
            return _super.call(this, unit, 'snake', paletteSwaps, { dx: 0, dy: 0 }) || this;
        }
        return SnakeSprite;
    }(UnitSprite_4.default));
    exports.default = SnakeSprite;
});
define("graphics/sprites/units/SoldierSprite", ["require", "exports", "graphics/sprites/units/UnitSprite"], function (require, exports, UnitSprite_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SoldierSprite = /** @class */ (function (_super) {
        __extends(SoldierSprite, _super);
        function SoldierSprite(unit, paletteSwaps) {
            return _super.call(this, unit, 'soldier', paletteSwaps, { dx: -4, dy: -20 }) || this;
        }
        return SoldierSprite;
    }(UnitSprite_5.default));
    exports.default = SoldierSprite;
});
define("graphics/sprites/projectiles/ProjectileSprite", ["require", "exports", "graphics/ImageSupplier", "graphics/sprites/Sprite", "types/Colors", "types/Directions"], function (require, exports, ImageSupplier_2, Sprite_2, Colors_2, Directions_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
                _a[SpriteKey.N] = new ImageSupplier_2.default(spriteName + "/" + spriteName + "_N_1", Colors_2.default.WHITE, paletteSwaps),
                _a[SpriteKey.E] = new ImageSupplier_2.default(spriteName + "/" + spriteName + "_E_1", Colors_2.default.WHITE, paletteSwaps),
                _a[SpriteKey.S] = new ImageSupplier_2.default(spriteName + "/" + spriteName + "_S_1", Colors_2.default.WHITE, paletteSwaps),
                _a[SpriteKey.W] = new ImageSupplier_2.default(spriteName + "/" + spriteName + "_W_1", Colors_2.default.WHITE, paletteSwaps),
                _a);
            _this = _super.call(this, imageMap, Directions_2.default.toString(direction), spriteOffsets) || this;
            _this._direction = direction;
            return _this;
        }
        ProjectileSprite.prototype.update = function () {
            return this.getImage();
        };
        return ProjectileSprite;
    }(Sprite_2.default));
    exports.default = ProjectileSprite;
});
define("graphics/sprites/projectiles/ArrowSprite", ["require", "exports", "graphics/sprites/projectiles/ProjectileSprite"], function (require, exports, ProjectileSprite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ArrowSprite = /** @class */ (function (_super) {
        __extends(ArrowSprite, _super);
        function ArrowSprite(direction, paletteSwaps) {
            return _super.call(this, direction, 'arrow', paletteSwaps, { dx: 0, dy: -8 }) || this;
        }
        return ArrowSprite;
    }(ProjectileSprite_1.default));
    exports.default = ArrowSprite;
});
define("graphics/sprites/SpriteFactory", ["require", "exports", "graphics/ImageSupplier", "graphics/sprites/Sprite", "types/Colors", "graphics/sprites/units/PlayerSprite", "graphics/sprites/units/GolemSprite", "graphics/sprites/units/GruntSprite", "graphics/sprites/units/SnakeSprite", "graphics/sprites/units/SoldierSprite", "graphics/sprites/projectiles/ArrowSprite"], function (require, exports, ImageSupplier_3, Sprite_3, Colors_3, PlayerSprite_1, GolemSprite_1, GruntSprite_1, SnakeSprite_1, SoldierSprite_1, ArrowSprite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DEFAULT_SPRITE_KEY = 'default';
    function createStaticSprite(imageLoader, _a) {
        var _b;
        var dx = _a.dx, dy = _a.dy;
        return new Sprite_3.default((_b = {}, _b[DEFAULT_SPRITE_KEY] = imageLoader, _b), DEFAULT_SPRITE_KEY, { dx: dx, dy: dy });
    }
    exports.createStaticSprite = createStaticSprite;
    var StaticSprites = {
        MAP_SWORD: function (paletteSwaps) { return createStaticSprite(new ImageSupplier_3.default('sword_icon', Colors_3.default.WHITE, paletteSwaps), { dx: 0, dy: -8 }); },
        MAP_POTION: function (paletteSwaps) { return createStaticSprite(new ImageSupplier_3.default('potion_icon', Colors_3.default.WHITE, paletteSwaps), { dx: 0, dy: -8 }); },
        MAP_SCROLL: function (paletteSwaps) { return createStaticSprite(new ImageSupplier_3.default('scroll_icon', Colors_3.default.WHITE, paletteSwaps), { dx: 0, dy: 0 }); },
        MAP_BOW: function (paletteSwaps) { return createStaticSprite(new ImageSupplier_3.default('bow_icon', Colors_3.default.WHITE, paletteSwaps), { dx: 0, dy: 0 }); }
    };
    var UnitSprites = {
        PLAYER: function (unit, paletteSwaps) { return new PlayerSprite_1.default(unit, paletteSwaps); },
        GOLEM: function (unit, paletteSwaps) { return new GolemSprite_1.default(unit, paletteSwaps); },
        GRUNT: function (unit, paletteSwaps) { return new GruntSprite_1.default(unit, paletteSwaps); },
        SNAKE: function (unit, paletteSwaps) { return new SnakeSprite_1.default(unit, paletteSwaps); },
        SOLDIER: function (unit, paletteSwaps) { return new SoldierSprite_1.default(unit, paletteSwaps); }
    };
    var ProjectileSprites = {
        ARROW: function (direction, paletteSwaps) { return new ArrowSprite_1.default(direction, paletteSwaps); }
    };
    // the following does not work: { ...StaticSprites, ...UnitSprites }
    // :(
    exports.default = {
        MAP_SWORD: StaticSprites.MAP_SWORD,
        MAP_POTION: StaticSprites.MAP_POTION,
        MAP_SCROLL: StaticSprites.MAP_SCROLL,
        MAP_BOW: StaticSprites.MAP_BOW,
        PLAYER: UnitSprites.PLAYER,
        GOLEM: UnitSprites.GOLEM,
        GRUNT: UnitSprites.GRUNT,
        SNAKE: UnitSprites.SNAKE,
        SOLDIER: UnitSprites.SOLDIER,
        ARROW: ProjectileSprites.ARROW
    };
});
define("items/ProjectileFactory", ["require", "exports", "graphics/sprites/SpriteFactory"], function (require, exports, SpriteFactory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createArrow(_a, direction) {
        var x = _a.x, y = _a.y;
        return {
            x: x,
            y: y,
            direction: direction,
            sprite: SpriteFactory_1.default.ARROW(direction, {}),
            char: 'x'
        };
    }
    exports.createArrow = createArrow;
});
define("graphics/animations/Animations", ["require", "exports", "types/types", "utils/PromiseUtils", "items/ProjectileFactory"], function (require, exports, types_2, PromiseUtils_2, ProjectileFactory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FRAME_LENGTH = 150; // milliseconds
    function playAttackingAnimation(source, target) {
        return _playAnimation({
            frames: [
                {
                    units: [
                        { unit: source, activity: types_2.Activity.ATTACKING },
                        { unit: target, activity: types_2.Activity.DAMAGED }
                    ],
                },
                {
                    units: [
                        { unit: source, activity: types_2.Activity.STANDING },
                        { unit: target, activity: types_2.Activity.STANDING }
                    ]
                }
            ],
            delay: FRAME_LENGTH
        });
    }
    exports.playAttackingAnimation = playAttackingAnimation;
    function playArrowAnimation(source, direction, coordinatesList, target) {
        var frames = [];
        // first frame
        {
            var frame = {
                units: [
                    { unit: source, activity: types_2.Activity.ATTACKING }
                ]
            };
            if (target) {
                frame.units.push({ unit: target, activity: types_2.Activity.STANDING });
            }
            frames.push(frame);
        }
        // arrow movement frames
        coordinatesList.forEach(function (_a) {
            var x = _a.x, y = _a.y;
            var projectile = ProjectileFactory_1.createArrow({ x: x, y: y }, direction);
            var frame = {
                units: [{ unit: source, activity: types_2.Activity.ATTACKING }],
                projectiles: [projectile]
            };
            if (target) {
                frame.units.push({ unit: target, activity: types_2.Activity.STANDING });
            }
            frames.push(frame);
        });
        // last frames
        {
            var frame = {
                units: [
                    { unit: source, activity: types_2.Activity.STANDING }
                ]
            };
            if (target) {
                frame.units.push({ unit: target, activity: types_2.Activity.DAMAGED });
            }
            frames.push(frame);
        }
        {
            var frame = {
                units: [
                    { unit: source, activity: types_2.Activity.STANDING }
                ]
            };
            if (target) {
                frame.units.push({ unit: target, activity: types_2.Activity.STANDING });
            }
            frames.push(frame);
        }
        return _playAnimation({
            frames: frames,
            delay: 50
        });
    }
    exports.playArrowAnimation = playArrowAnimation;
    function playFloorFireAnimation(source, targets) {
        var frames = [];
        for (var i = 0; i < targets.length; i++) {
            var frame_1 = [];
            frame_1.push({ unit: source, activity: types_2.Activity.STANDING });
            for (var j = 0; j < targets.length; j++) {
                var activity = (j === i) ? types_2.Activity.DAMAGED : types_2.Activity.STANDING;
                frame_1.push({ unit: targets[j], activity: activity });
            }
            frames.push({ units: frame_1 });
        }
        // last frame (all standing)
        var frame = [];
        frame.push({ unit: source, activity: types_2.Activity.STANDING });
        for (var i = 0; i < targets.length; i++) {
            frame.push({ unit: targets[i], activity: types_2.Activity.STANDING });
        }
        frames.push({ units: frame });
        return _playAnimation({
            frames: frames,
            delay: FRAME_LENGTH
        });
    }
    exports.playFloorFireAnimation = playFloorFireAnimation;
    function _playAnimation(animation) {
        var delay = animation.delay, frames = animation.frames;
        var promises = [];
        var _loop_4 = function (i) {
            var frame = frames[i];
            var map = jwb.state.getMap();
            promises.push(function () {
                var _a;
                if (!!frame.projectiles) {
                    (_a = map.projectiles).push.apply(_a, frame.projectiles);
                }
                return PromiseUtils_2.resolvedPromise();
            });
            var updatePromise = function () {
                var updatePromises = [];
                for (var j = 0; j < frame.units.length; j++) {
                    var _a = frame.units[j], unit = _a.unit, activity = _a.activity;
                    unit.activity = activity;
                    updatePromises.push(unit.sprite.update());
                }
                return Promise.all(updatePromises);
            };
            promises.push(updatePromise);
            promises.push(function () {
                return jwb.renderer.render();
            });
            if (i < (frames.length - 1)) {
                promises.push(function () {
                    return PromiseUtils_2.wait(delay);
                });
            }
            promises.push(function () {
                if (!!frame.projectiles) {
                    frame.projectiles.forEach(function (projectile) { return map.removeProjectile(projectile); });
                }
                return PromiseUtils_2.resolvedPromise();
            });
        };
        for (var i = 0; i < frames.length; i++) {
            _loop_4(i);
        }
        return PromiseUtils_2.chainPromises(promises);
    }
});
define("units/UnitUtils", ["require", "exports", "sounds/Sounds", "types/types", "sounds/SoundFX", "graphics/animations/Animations"], function (require, exports, Sounds_1, types_3, SoundFX_1, Animations_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function moveOrAttack(unit, _a) {
        var x = _a.x, y = _a.y;
        var _b = jwb.state, messages = _b.messages, playerUnit = _b.playerUnit;
        var map = jwb.state.getMap();
        unit.direction = { dx: x - unit.x, dy: y - unit.y };
        return new Promise(function (resolve) {
            var _a;
            if (map.contains({ x: x, y: y }) && !map.isBlocked({ x: x, y: y })) {
                _a = [x, y], unit.x = _a[0], unit.y = _a[1];
                if (unit === playerUnit) {
                    SoundFX_1.playSound(Sounds_1.default.FOOTSTEP);
                }
                resolve();
            }
            else {
                var targetUnit_1 = map.getUnit({ x: x, y: y });
                if (!!targetUnit_1) {
                    var damage_1 = unit.getDamage();
                    messages.push(unit.name + " hit " + targetUnit_1.name);
                    messages.push("for " + damage_1 + " damage!");
                    Animations_1.playAttackingAnimation(unit, targetUnit_1)
                        .then(function () { return targetUnit_1.takeDamage(damage_1, unit); })
                        .then(function () { return resolve(); });
                }
                else {
                    resolve();
                }
            }
        });
    }
    exports.moveOrAttack = moveOrAttack;
    function fireProjectile(unit, _a) {
        var dx = _a.dx, dy = _a.dy;
        unit.direction = { dx: dx, dy: dy };
        return unit.sprite.update()
            .then(function () { return jwb.renderer.render(); })
            .then(function () { return new Promise(function (resolve) {
            if (!unit.equipment.get(types_3.EquipmentSlot.RANGED_WEAPON)) {
                // change direction and re-render, but don't do anything (don't spend a turn)
                resolve();
                return;
            }
            var map = jwb.state.getMap();
            var coordinatesList = [];
            var _a = { x: unit.x + dx, y: unit.y + dy }, x = _a.x, y = _a.y;
            while (map.contains({ x: x, y: y }) && !map.isBlocked({ x: x, y: y })) {
                coordinatesList.push({ x: x, y: y });
                x += dx;
                y += dy;
            }
            var targetUnit = map.getUnit({ x: x, y: y });
            if (!!targetUnit) {
                var messages = jwb.state.messages;
                var damage_2 = unit.getRangedDamage();
                messages.push(unit.name + " hit " + targetUnit.name);
                messages.push("for " + damage_2 + " damage!");
                Animations_1.playArrowAnimation(unit, { dx: dx, dy: dy }, coordinatesList, targetUnit)
                    .then(function () { return targetUnit.takeDamage(damage_2, unit); })
                    .then(function () { return resolve(); });
            }
            else {
                Animations_1.playArrowAnimation(unit, { dx: dx, dy: dy }, coordinatesList, null)
                    .then(function () { return resolve(); });
            }
        }); });
    }
    exports.fireProjectile = fireProjectile;
});
define("units/UnitBehaviors", ["require", "exports", "utils/Pathfinder", "utils/RandomUtils", "units/UnitUtils", "utils/PromiseUtils", "utils/ArrayUtils", "maps/MapUtils", "types/Directions"], function (require, exports, Pathfinder_1, RandomUtils_3, UnitUtils_1, PromiseUtils_3, ArrayUtils_2, MapUtils_2, Directions_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function _wanderAndAttack(unit) {
        var playerUnit = jwb.state.playerUnit;
        var map = jwb.state.getMap();
        var tiles = [];
        Directions_3.default.values().forEach(function (_a) {
            var dx = _a.dx, dy = _a.dy;
            var _b = [unit.x + dx, unit.y + dy], x = _b[0], y = _b[1];
            if (map.contains({ x: x, y: y })) {
                if (!map.isBlocked({ x: x, y: y })) {
                    tiles.push({ x: x, y: y });
                }
                else if (map.getUnit({ x: x, y: y })) {
                    if (map.getUnit({ x: x, y: y }) === playerUnit) {
                        tiles.push({ x: x, y: y });
                    }
                }
            }
        });
        if (tiles.length > 0) {
            var _a = RandomUtils_3.randChoice(tiles), x = _a.x, y = _a.y;
            return UnitUtils_1.moveOrAttack(unit, { x: x, y: y });
        }
        return PromiseUtils_3.resolvedPromise();
    }
    function _wander(unit) {
        var map = jwb.state.getMap();
        var tiles = [];
        Directions_3.default.values().forEach(function (_a) {
            var dx = _a.dx, dy = _a.dy;
            var _b = [unit.x + dx, unit.y + dy], x = _b[0], y = _b[1];
            if (map.contains({ x: x, y: y })) {
                if (!map.isBlocked({ x: x, y: y })) {
                    tiles.push({ x: x, y: y });
                }
            }
        });
        if (tiles.length > 0) {
            var _a = RandomUtils_3.randChoice(tiles), x = _a.x, y = _a.y;
            return UnitUtils_1.moveOrAttack(unit, { x: x, y: y });
        }
        return PromiseUtils_3.resolvedPromise();
    }
    function _attackPlayerUnit_withPath(unit) {
        var playerUnit = jwb.state.playerUnit;
        var map = jwb.state.getMap();
        var mapRect = map.getRect();
        var unblockedTiles = [];
        for (var y = 0; y < mapRect.height; y++) {
            for (var x = 0; x < mapRect.width; x++) {
                if (!map.getTile({ x: x, y: y }).isBlocking) {
                    unblockedTiles.push({ x: x, y: y });
                }
                else if (MapUtils_2.coordinatesEquals({ x: x, y: y }, playerUnit)) {
                    unblockedTiles.push({ x: x, y: y });
                }
                else {
                    // blocked
                }
            }
        }
        var path = new Pathfinder_1.default(function () { return 1; }).findPath(unit, playerUnit, unblockedTiles);
        if (path.length > 1) {
            var _a = path[1], x = _a.x, y = _a.y; // first tile is the unit's own tile
            var unitAtPoint = map.getUnit({ x: x, y: y });
            if (!unitAtPoint || unitAtPoint === playerUnit) {
                return UnitUtils_1.moveOrAttack(unit, { x: x, y: y });
            }
        }
        return PromiseUtils_3.resolvedPromise();
    }
    function _fleeFromPlayerUnit(unit) {
        var playerUnit = jwb.state.playerUnit;
        var map = jwb.state.getMap();
        var tiles = [];
        Directions_3.default.values().forEach(function (_a) {
            var dx = _a.dx, dy = _a.dy;
            var _b = [unit.x + dx, unit.y + dy], x = _b[0], y = _b[1];
            if (map.contains({ x: x, y: y })) {
                if (!map.isBlocked({ x: x, y: y })) {
                    tiles.push({ x: x, y: y });
                }
                else if (map.getUnit({ x: x, y: y })) {
                    if (map.getUnit({ x: x, y: y }) === playerUnit) {
                        tiles.push({ x: x, y: y });
                    }
                }
            }
        });
        if (tiles.length > 0) {
            var orderedTiles = tiles.sort(ArrayUtils_2.comparingReversed(function (coordinates) { return MapUtils_2.manhattanDistance(coordinates, playerUnit); }));
            var _a = orderedTiles[0], x = _a.x, y = _a.y;
            return UnitUtils_1.moveOrAttack(unit, { x: x, y: y });
        }
        return PromiseUtils_3.resolvedPromise();
    }
    var UnitBehaviors = {
        WANDER: _wander,
        ATTACK_PLAYER: _attackPlayerUnit_withPath,
        FLEE_FROM_PLAYER: _fleeFromPlayerUnit,
        STAY: function () { return PromiseUtils_3.resolvedPromise(); }
    };
    exports.default = UnitBehaviors;
});
define("units/UnitAI", ["require", "exports", "units/UnitBehaviors", "maps/MapUtils", "utils/RandomUtils"], function (require, exports, UnitBehaviors_1, MapUtils_3, RandomUtils_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var behaviorMap = {
        'ATTACK_PLAYER': UnitBehaviors_1.default.ATTACK_PLAYER,
        'WANDER': UnitBehaviors_1.default.WANDER,
        'FLEE_FROM_PLAYER': UnitBehaviors_1.default.FLEE_FROM_PLAYER,
        'STAY': UnitBehaviors_1.default.STAY
    };
    var HUMAN_CAUTIOUS = function (unit) {
        var playerUnit = jwb.state.playerUnit;
        var behavior;
        var distanceToPlayer = MapUtils_3.manhattanDistance(unit, playerUnit);
        if (distanceToPlayer === 1) {
            if ((unit.life / unit.maxLife) >= 0.4) {
                behavior = UnitBehaviors_1.default.ATTACK_PLAYER;
            }
            else {
                behavior = RandomUtils_4.weightedRandom({
                    'ATTACK_PLAYER': 0.2,
                    'WANDER': 0.5,
                    'FLEE_FROM_PLAYER': 0.3
                }, behaviorMap);
            }
        }
        else if (distanceToPlayer >= 5) {
            behavior = RandomUtils_4.weightedRandom({
                'WANDER': 0.3,
                'ATTACK_PLAYER': 0.1,
                'STAY': 0.6
            }, behaviorMap);
        }
        else {
            behavior = RandomUtils_4.weightedRandom({
                'ATTACK_PLAYER': 0.6,
                'WANDER': 0.2,
                'STAY': 0.2
            }, behaviorMap);
        }
        return behavior(unit);
    };
    exports.HUMAN_CAUTIOUS = HUMAN_CAUTIOUS;
    var HUMAN_AGGRESSIVE = function (unit) {
        var playerUnit = jwb.state.playerUnit;
        var behavior;
        var distanceToPlayer = MapUtils_3.manhattanDistance(unit, playerUnit);
        if (distanceToPlayer === 1) {
            behavior = UnitBehaviors_1.default.ATTACK_PLAYER;
        }
        else if (distanceToPlayer >= 6) {
            behavior = RandomUtils_4.weightedRandom({
                'WANDER': 0.4,
                'STAY': 0.4,
                'ATTACK_PLAYER': 0.2
            }, behaviorMap);
        }
        else {
            behavior = RandomUtils_4.weightedRandom({
                'ATTACK_PLAYER': 0.9,
                'STAY': 0.1
            }, behaviorMap);
        }
        return behavior(unit);
    };
    exports.HUMAN_AGGRESSIVE = HUMAN_AGGRESSIVE;
    var HUMAN_DETERMINISTIC = function (unit) {
        var _a = jwb.state, playerUnit = _a.playerUnit, turn = _a.turn;
        var aiParams = unit.unitClass.aiParams;
        if (!aiParams) {
            throw 'HUMAN_DETERMINISTIC behavior requires aiParams!';
        }
        var speed = aiParams.speed, visionRange = aiParams.visionRange, fleeThreshold = aiParams.fleeThreshold;
        var behavior;
        var distanceToPlayer = MapUtils_3.manhattanDistance(unit, playerUnit);
        if (!_canMove(speed)) {
            behavior = UnitBehaviors_1.default.STAY;
        }
        else if ((unit.life / unit.maxLife) < fleeThreshold) {
            behavior = UnitBehaviors_1.default.FLEE_FROM_PLAYER;
        }
        else if (distanceToPlayer <= visionRange) {
            behavior = UnitBehaviors_1.default.ATTACK_PLAYER;
        }
        else {
            if (RandomUtils_4.randInt(0, 1) === 1) {
                behavior = UnitBehaviors_1.default.STAY;
            }
            else {
                behavior = UnitBehaviors_1.default.WANDER;
            }
        }
        return behavior(unit);
    };
    exports.HUMAN_DETERMINISTIC = HUMAN_DETERMINISTIC;
    function _canMove(speed) {
        // deterministic version
        // const { turn } = jwb.state;
        // return Math.floor(speed * turn) > Math.floor(speed * (turn - 1));
        // random version
        return Math.random() < speed;
    }
});
define("units/UnitClass", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("items/InventoryItem", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var InventoryItem = /** @class */ (function () {
        function InventoryItem(name, category, onUse) {
            var _this = this;
            this.name = name;
            this.category = category;
            this._onUse = function (unit) { return onUse(_this, unit); };
        }
        InventoryItem.prototype.use = function (unit) {
            return this._onUse(unit);
        };
        return InventoryItem;
    }());
    exports.default = InventoryItem;
});
define("items/InventoryMap", ["require", "exports", "types/types"], function (require, exports, types_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var categories = Object.values(types_4.ItemCategory);
    /**
     * Contains information about all items held by a particular unit, grouped by category,
     * as well as data about the selected item/category in the inventory menu
     * (although this is only applicable to the player unit)
     */
    var InventoryMap = /** @class */ (function () {
        function InventoryMap() {
            // @ts-ignore
            this._map = {};
            for (var _i = 0, categories_1 = categories; _i < categories_1.length; _i++) {
                var category = categories_1[_i];
                this._map[category] = [];
            }
            this.selectedCategory = categories[0];
            this.selectedItem = null;
        }
        InventoryMap.prototype.add = function (item) {
            this._map[item.category].push(item);
            if (this.selectedCategory === item.category && this.selectedItem === null) {
                this.selectedItem = item;
            }
        };
        InventoryMap.prototype.remove = function (item) {
            var items = this._map[item.category];
            var index = items.indexOf(item);
            items.splice(index, 1);
            if (this.selectedItem === item) {
                this.selectedItem = items[index % items.length] || null;
            }
        };
        InventoryMap.prototype.nextCategory = function () {
            var index = categories.indexOf(this.selectedCategory);
            this.selectedCategory = categories[(index + 1) % categories.length];
            this.selectedItem = this._map[this.selectedCategory][0] || null;
        };
        InventoryMap.prototype.previousCategory = function () {
            var index = categories.indexOf(this.selectedCategory);
            this.selectedCategory = categories[(index - 1 + categories.length) % categories.length];
            this.selectedItem = this._map[this.selectedCategory][0] || null;
        };
        InventoryMap.prototype.get = function (category) {
            return __spreadArrays(this._map[category]);
        };
        InventoryMap.prototype.nextItem = function () {
            var items = this._map[this.selectedCategory];
            if (items.length > 0 && this.selectedItem !== null) {
                var index = items.indexOf(this.selectedItem);
                this.selectedItem = items[(index + 1) % items.length];
            }
        };
        InventoryMap.prototype.previousItem = function () {
            var items = this._map[this.selectedCategory];
            if (items.length > 0 && this.selectedItem !== null) {
                var index = items.indexOf(this.selectedItem);
                this.selectedItem = items[(index - 1 + items.length) % items.length];
            }
        };
        return InventoryMap;
    }());
    exports.default = InventoryMap;
});
define("items/equipment/EquippedItem", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var EquippedItem = /** @class */ (function () {
        function EquippedItem(name, slot, inventoryItem, damage) {
            this.name = name;
            this.slot = slot;
            this.inventoryItem = inventoryItem;
            this.damage = damage;
        }
        return EquippedItem;
    }());
    exports.default = EquippedItem;
});
define("items/equipment/EquipmentMap", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Represent's a unit's equipment, mapped by slot.
     */
    var EquipmentMap = /** @class */ (function () {
        function EquipmentMap() {
            this._map = {};
        }
        EquipmentMap.prototype.add = function (item) {
            this._map[item.slot] = item;
        };
        EquipmentMap.prototype.remove = function (item) {
            this._map[item.slot] = undefined;
        };
        EquipmentMap.prototype.get = function (category) {
            return this._map[category] || null;
        };
        EquipmentMap.prototype.getEntries = function () {
            return __spreadArrays(Object.entries(this._map));
        };
        return EquipmentMap;
    }());
    exports.default = EquipmentMap;
});
define("sounds/AudioUtils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function transpose8va(_a) {
        var freq = _a[0], ms = _a[1];
        return [freq * 2, ms];
    }
    exports.transpose8va = transpose8va;
    function transpose8vb(_a) {
        var freq = _a[0], ms = _a[1];
        return [freq / 2, ms];
    }
    exports.transpose8vb = transpose8vb;
});
define("sounds/Music", ["require", "exports", "sounds/SoundPlayer", "utils/RandomUtils", "sounds/AudioUtils"], function (require, exports, SoundPlayer_2, RandomUtils_5, AudioUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // TODO very hacky memoizing
    var PLAYER = null;
    var ACTIVE_SUITE = null;
    var _getMusicPlayer = function () { return new SoundPlayer_2.default(4, 0.12); };
    function playSuite(suite) {
        ACTIVE_SUITE = suite;
        var sections = Object.values(suite.sections);
        var numRepeats = 4;
        var _loop_5 = function (i) {
            var section = sections[i];
            var bass = (!!section.bass) ? RandomUtils_5.randChoice(section.bass) : null;
            var lead;
            if (!!section.lead) {
                do {
                    lead = RandomUtils_5.randChoice(section.lead);
                } while (lead === bass);
            }
            for (var j = 0; j < numRepeats; j++) {
                setTimeout(function () {
                    if (suite === ACTIVE_SUITE) {
                        var figures = __spreadArrays((!!bass ? [bass.map(AudioUtils_1.transpose8vb)] : []), (!!lead ? [lead] : []));
                        figures.forEach(function (figure) { return playMusic(figure); });
                    }
                }, ((numRepeats * i) + j) * suite.length);
            }
        };
        for (var i = 0; i < sections.length; i++) {
            _loop_5(i);
        }
        setTimeout(function () {
            if (suite === ACTIVE_SUITE) {
                playSuite(suite);
            }
        }, sections.length * suite.length * numRepeats);
    }
    function playMusic(samples) {
        if (!PLAYER) {
            PLAYER = _getMusicPlayer();
        }
        PLAYER.playSound(samples, false);
    }
    function stopMusic() {
        if (PLAYER) {
            PLAYER.stop();
        }
    }
    function stop() {
        stopMusic();
        ACTIVE_SUITE = null;
    }
    exports.default = {
        playSuite: playSuite,
        stop: stop
    };
});
define("units/Unit", ["require", "exports", "sounds/Sounds", "items/InventoryMap", "items/equipment/EquipmentMap", "sounds/Music", "types/types", "utils/PromiseUtils", "sounds/SoundFX"], function (require, exports, Sounds_2, InventoryMap_1, EquipmentMap_1, Music_1, types_5, PromiseUtils_4, SoundFX_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LIFE_PER_TURN_MULTIPLIER = 0.005;
    var Unit = /** @class */ (function () {
        function Unit(unitClass, name, level, _a) {
            var x = _a.x, y = _a.y;
            this.char = '@';
            this.unitClass = unitClass;
            this.sprite = unitClass.sprite(this, unitClass.paletteSwaps);
            this.inventory = new InventoryMap_1.default();
            this.equipment = new EquipmentMap_1.default();
            this.x = x;
            this.y = y;
            this.name = name;
            this.level = 1;
            this.experience = 0;
            this.life = unitClass.startingLife;
            this.maxLife = unitClass.startingLife;
            this.mana = unitClass.startingMana;
            this.maxMana = unitClass.startingMana;
            this.lifeRemainder = 0;
            this._damage = unitClass.startingDamage;
            this.queuedOrder = null;
            this.aiHandler = unitClass.aiHandler;
            this.activity = types_5.Activity.STANDING;
            this.direction = null;
            while (this.level < level) {
                this._levelUp(false);
            }
        }
        Unit.prototype._regenLife = function () {
            var lifePerTurn = this.maxLife * LIFE_PER_TURN_MULTIPLIER;
            this.lifeRemainder += lifePerTurn;
            var deltaLife = Math.floor(this.lifeRemainder);
            this.lifeRemainder -= deltaLife;
            this.life = Math.min(this.life + deltaLife, this.maxLife);
        };
        ;
        Unit.prototype.update = function () {
            var _this = this;
            return new Promise(function (resolve) {
                _this._regenLife();
                if (!!_this.queuedOrder) {
                    var queuedOrder = _this.queuedOrder;
                    _this.queuedOrder = null;
                    return queuedOrder()
                        .then(function () { return resolve(); });
                }
                return resolve();
            })
                .then(function () {
                if (!!_this.aiHandler) {
                    return _this.aiHandler(_this);
                }
                return PromiseUtils_4.resolvedPromise();
            })
                .then(function () { return _this.sprite.update(); });
        };
        Unit.prototype.getDamage = function () {
            var damage = this._damage;
            this.equipment.getEntries()
                .filter(function (_a) {
                var slot = _a[0], item = _a[1];
                return (slot !== types_5.EquipmentSlot.RANGED_WEAPON);
            })
                .forEach(function (_a) {
                var slot = _a[0], item = _a[1];
                damage += (item.damage || 0);
            });
            return damage;
        };
        Unit.prototype.getRangedDamage = function () {
            var damage = this._damage;
            this.equipment.getEntries()
                .filter(function (_a) {
                var slot = _a[0], item = _a[1];
                return (slot !== types_5.EquipmentSlot.MELEE_WEAPON);
            })
                .forEach(function (_a) {
                var slot = _a[0], item = _a[1];
                if (slot === types_5.EquipmentSlot.RANGED_WEAPON) {
                    damage += (item.damage || 0);
                }
                else {
                    damage += (item.damage || 0) / 2;
                }
            });
            return Math.round(damage);
        };
        Unit.prototype._levelUp = function (withSound) {
            this.level++;
            var lifePerLevel = this.unitClass.lifePerLevel(this.level);
            this.maxLife += lifePerLevel;
            this.life += lifePerLevel;
            this._damage += this.unitClass.damagePerLevel(this.level);
            if (withSound) {
                SoundFX_2.playSound(Sounds_2.default.LEVEL_UP);
            }
        };
        Unit.prototype.gainExperience = function (experience) {
            this.experience += experience;
            var experienceToNextLevel = this.experienceToNextLevel();
            while (!!experienceToNextLevel && this.experience >= experienceToNextLevel) {
                this.experience -= experienceToNextLevel;
                this._levelUp(true);
            }
        };
        Unit.prototype.experienceToNextLevel = function () {
            var unitClass = this.unitClass;
            if (unitClass.experienceToNextLevel && (this.level < unitClass.maxLevel)) {
                return unitClass.experienceToNextLevel(this.level);
            }
            return null;
        };
        Unit.prototype.takeDamage = function (damage, sourceUnit) {
            var _this = this;
            if (sourceUnit === void 0) { sourceUnit = undefined; }
            var playerUnit = jwb.state.playerUnit;
            var map = jwb.state.getMap();
            return new Promise(function (resolve) {
                _this.life = Math.max(_this.life - damage, 0);
                if (_this.life === 0) {
                    map.removeUnit(_this);
                    if (_this === playerUnit) {
                        jwb.state.screen = types_5.GameScreen.GAME_OVER;
                        Music_1.default.stop();
                        SoundFX_2.playSound(Sounds_2.default.PLAYER_DIES);
                    }
                    else {
                        SoundFX_2.playSound(Sounds_2.default.ENEMY_DIES);
                    }
                    if (sourceUnit) {
                        sourceUnit.gainExperience(1);
                    }
                }
                else {
                    if (_this === playerUnit) {
                        SoundFX_2.playSound(Sounds_2.default.PLAYER_HITS_ENEMY);
                    }
                    else {
                        SoundFX_2.playSound(Sounds_2.default.ENEMY_HITS_PLAYER);
                    }
                }
                resolve();
            });
        };
        ;
        return Unit;
    }());
    exports.default = Unit;
});
define("items/MapItem", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MapItem = /** @class */ (function () {
        function MapItem(_a, char, sprite, inventoryItem) {
            var x = _a.x, y = _a.y;
            this.x = x;
            this.y = y;
            this.char = char;
            this.sprite = sprite;
            this.inventoryItem = inventoryItem;
        }
        return MapItem;
    }());
    exports.default = MapItem;
});
define("maps/MapInstance", ["require", "exports", "types/types"], function (require, exports, types_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
                return (this._tiles[y] || [])[x] || types_6.TileType.NONE;
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
    exports.default = MapInstance;
});
define("maps/MapBuilder", ["require", "exports", "maps/MapInstance"], function (require, exports, MapInstance_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
            return new MapInstance_1.default(this._width, this._height, this._tiles, this._rooms, units, items);
        };
        return MapBuilder;
    }());
    exports.default = MapBuilder;
});
define("core/GameState", ["require", "exports", "types/types"], function (require, exports, types_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Global mutable state
     */
    var GameState = /** @class */ (function () {
        function GameState(playerUnit, maps) {
            this.screen = types_7.GameScreen.TITLE;
            this.playerUnit = playerUnit;
            this.maps = maps;
            this.mapIndex = 0;
            this._map = null;
            this.messages = [];
            this.turn = 1;
        }
        GameState.prototype.getMap = function () {
            if (!this._map) {
                throw 'Tried to retrieve map before map was loaded';
            }
            return this._map;
        };
        GameState.prototype.setMap = function (map) {
            this._map = map;
        };
        return GameState;
    }());
    exports.default = GameState;
});
define("core/TurnHandler", ["require", "exports", "utils/PromiseUtils"], function (require, exports, PromiseUtils_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function playTurn(playerUnitOrder) {
        var playerUnit = jwb.state.playerUnit;
        playerUnit.queuedOrder = !!playerUnitOrder ? (function () { return playerUnitOrder(playerUnit); }) : null;
        return _update();
    }
    function _update() {
        var state = jwb.state;
        var playerUnit = state.playerUnit;
        var map = state.getMap();
        // make sure the player unit's update happens first
        var unitPromises = [];
        unitPromises.push(function () { return playerUnit.update(); });
        map.units.forEach(function (u) {
            if (u !== playerUnit) {
                unitPromises.push(function () { return u.update(); });
            }
        });
        return PromiseUtils_5.chainPromises(unitPromises)
            .then(function () { return jwb.renderer.render(); })
            .then(function () {
            state.turn++;
            state.messages = [];
        });
    }
    exports.default = {
        playTurn: playTurn
    };
});
define("items/ItemUtils", ["require", "exports", "sounds/SoundFX", "sounds/Sounds"], function (require, exports, SoundFX_3, Sounds_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function pickupItem(unit, mapItem) {
        var state = jwb.state;
        var inventoryItem = mapItem.inventoryItem;
        unit.inventory.add(inventoryItem);
        state.messages.push("Picked up a " + inventoryItem.name + ".");
        SoundFX_3.playSound(Sounds_3.default.PICK_UP_ITEM);
    }
    exports.pickupItem = pickupItem;
    function useItem(unit, item) {
        return item.use(unit)
            .then(function () { return unit.inventory.remove(item); });
    }
    exports.useItem = useItem;
});
define("graphics/Renderer", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Renderer = /** @class */ (function () {
        function Renderer() {
        }
        return Renderer;
    }());
    exports.default = Renderer;
});
define("graphics/FontRenderer", ["require", "exports", "graphics/ImageUtils", "utils/PromiseUtils", "types/Colors"], function (require, exports, ImageUtils_3, PromiseUtils_6, Colors_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
                return PromiseUtils_6.resolvedPromise(this._imageMemos[key]);
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
                return PromiseUtils_6.resolvedPromise();
            })
                .then(function () { return PromiseUtils_6.resolvedPromise(context.getImageData(0, 0, canvas.width, canvas.height)); })
                .then(function (imageData) {
                var _a;
                return ImageUtils_3.replaceColors(imageData, (_a = {}, _a[Colors_4.default.BLACK] = color, _a));
            })
                .then(function (imageData) { return createImageBitmap(imageData); })
                .then(function (imageBitmap) { _this._imageMemos[key] = imageBitmap; return imageBitmap; });
        };
        FontRenderer.prototype._loadFont = function (definition) {
            var _this = this;
            if (this._loadedFonts[definition.name]) {
                return PromiseUtils_6.resolvedPromise(this._loadedFonts[definition.name]);
            }
            var width = NUM_CHARACTERS * definition.width;
            return ImageUtils_3.loadImage("fonts/" + definition.src)
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
            return ImageUtils_3.applyTransparentColor(imageData, Colors_4.default.WHITE);
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
});
define("graphics/SpriteRenderer", ["require", "exports", "types/Colors", "utils/PromiseUtils", "maps/MapUtils", "types/types", "core/actions", "graphics/ImageUtils", "graphics/FontRenderer"], function (require, exports, Colors_5, PromiseUtils_7, MapUtils_4, types_8, actions_1, ImageUtils_4, FontRenderer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TILE_WIDTH = 32;
    var TILE_HEIGHT = 24;
    var WIDTH = 20; // in tiles
    var HEIGHT = 15; // in tiles
    var SCREEN_WIDTH = 640;
    var SCREEN_HEIGHT = 360;
    var HUD_HEIGHT = 3 * TILE_HEIGHT;
    var HUD_LEFT_WIDTH = 5 * TILE_WIDTH;
    var HUD_RIGHT_WIDTH = 5 * TILE_WIDTH;
    var HUD_MARGIN = 5;
    var INVENTORY_LEFT = 2 * TILE_WIDTH;
    var INVENTORY_TOP = 2 * TILE_HEIGHT;
    var INVENTORY_WIDTH = 16 * TILE_WIDTH;
    var INVENTORY_HEIGHT = 11 * TILE_HEIGHT;
    var LINE_HEIGHT = 16;
    var GAME_OVER_FILENAME = 'gameover';
    var TITLE_FILENAME = 'title';
    var VICTORY_FILENAME = 'victory';
    var HUD_FILENAME = 'HUD';
    var INVENTORY_BACKGROUND_FILENAME = 'inventory_background';
    var SHADOW_FILENAME = 'shadow';
    var SpriteRenderer = /** @class */ (function () {
        function SpriteRenderer() {
            this._container = document.getElementById('container');
            this._container.innerHTML = '';
            this._bufferCanvas = document.createElement('canvas');
            this._bufferCanvas.width = WIDTH * TILE_WIDTH;
            this._bufferCanvas.height = HEIGHT * TILE_HEIGHT;
            this._bufferContext = this._bufferCanvas.getContext('2d');
            this._bufferContext.imageSmoothingEnabled = false;
            this._fontRenderer = new FontRenderer_1.default();
            this._canvas = document.createElement('canvas');
            this._canvas.width = WIDTH * TILE_WIDTH;
            this._canvas.height = HEIGHT * TILE_HEIGHT;
            this._context = this._canvas.getContext('2d');
            this._bufferContext.imageSmoothingEnabled = false;
            this._container.appendChild(this._canvas);
        }
        SpriteRenderer.prototype.render = function () {
            var _this = this;
            return this._renderScreen()
                .then(function () { return _this._renderBuffer(); });
        };
        SpriteRenderer.prototype._renderScreen = function () {
            var _this = this;
            var screen = jwb.state.screen;
            switch (screen) {
                case types_8.GameScreen.TITLE:
                    return this._renderSplashScreen(TITLE_FILENAME, 'PRESS ENTER TO BEGIN');
                case types_8.GameScreen.GAME:
                    return this._renderGameScreen();
                case types_8.GameScreen.INVENTORY:
                    return this._renderGameScreen()
                        .then(function () { return _this._renderInventory(); });
                case types_8.GameScreen.VICTORY:
                    return this._renderSplashScreen(VICTORY_FILENAME, 'PRESS ENTER TO PLAY AGAIN');
                case types_8.GameScreen.GAME_OVER:
                    return this._renderSplashScreen(GAME_OVER_FILENAME, 'PRESS ENTER TO PLAY AGAIN');
                default:
                    throw "Invalid screen " + screen;
            }
        };
        SpriteRenderer.prototype._renderBuffer = function () {
            var _this = this;
            return createImageBitmap(this._bufferContext.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT))
                .then(function (imageBitmap) { return _this._context.drawImage(imageBitmap, 0, 0); });
        };
        SpriteRenderer.prototype._renderGameScreen = function () {
            var _this = this;
            actions_1.revealTiles();
            this._bufferContext.fillStyle = Colors_5.default.BLACK;
            this._bufferContext.fillRect(0, 0, this._bufferCanvas.width, this._bufferCanvas.height);
            return PromiseUtils_7.chainPromises([
                function () { return _this._renderTiles(); },
                function () { return _this._renderItems(); },
                function () { return _this._renderProjectiles(); },
                function () { return _this._renderUnits(); },
                function () { return _this._renderHUD(); }
            ]);
        };
        SpriteRenderer.prototype._renderTiles = function () {
            var promises = [];
            var map = jwb.state.getMap();
            for (var y = 0; y < map.height; y++) {
                for (var x = 0; x < map.width; x++) {
                    if (MapUtils_4.isTileRevealed({ x: x, y: y })) {
                        var tile = map.getTile({ x: x, y: y });
                        if (!!tile) {
                            promises.push(this._renderElement(tile, { x: x, y: y }));
                        }
                    }
                }
            }
            return Promise.all(promises);
        };
        SpriteRenderer.prototype._renderItems = function () {
            var _this = this;
            var map = jwb.state.getMap();
            var promises = [];
            var _loop_6 = function (y) {
                var _loop_7 = function (x) {
                    if (MapUtils_4.isTileRevealed({ x: x, y: y })) {
                        var item_1 = map.getItem({ x: x, y: y });
                        if (!!item_1) {
                            promises.push(this_2._drawEllipse({ x: x, y: y }, Colors_5.default.DARK_GRAY)
                                .then(function () { return _this._renderElement(item_1, { x: x, y: y }); }));
                        }
                    }
                };
                for (var x = 0; x < map.width; x++) {
                    _loop_7(x);
                }
            };
            var this_2 = this;
            for (var y = 0; y < map.height; y++) {
                _loop_6(y);
            }
            return Promise.all(promises);
        };
        SpriteRenderer.prototype._renderProjectiles = function () {
            var map = jwb.state.getMap();
            var promises = [];
            var _loop_8 = function (y) {
                var _loop_9 = function (x) {
                    if (MapUtils_4.isTileRevealed({ x: x, y: y })) {
                        var projectile = map.projectiles
                            .filter(function (p) { return MapUtils_4.coordinatesEquals(p, { x: x, y: y }); })[0];
                        if (!!projectile) {
                            promises.push(this_3._renderElement(projectile, { x: x, y: y }));
                        }
                    }
                };
                for (var x = 0; x < map.width; x++) {
                    _loop_9(x);
                }
            };
            var this_3 = this;
            for (var y = 0; y < map.height; y++) {
                _loop_8(y);
            }
            return Promise.all(promises);
        };
        SpriteRenderer.prototype._renderUnits = function () {
            var _this = this;
            var playerUnit = jwb.state.playerUnit;
            var map = jwb.state.getMap();
            var promises = [];
            var _loop_10 = function (y) {
                var _loop_11 = function (x) {
                    if (MapUtils_4.isTileRevealed({ x: x, y: y })) {
                        var unit_1 = map.getUnit({ x: x, y: y });
                        if (!!unit_1) {
                            var shadowColor = void 0;
                            if (unit_1 === playerUnit) {
                                shadowColor = Colors_5.default.GREEN;
                            }
                            else {
                                shadowColor = Colors_5.default.DARK_GRAY;
                            }
                            promises.push(this_4._drawEllipse({ x: x, y: y }, shadowColor)
                                .then(function () { return _this._renderElement(unit_1, { x: x, y: y }); }));
                        }
                    }
                };
                for (var x = 0; x < map.width; x++) {
                    _loop_11(x);
                }
            };
            var this_4 = this;
            for (var y = 0; y < map.height; y++) {
                _loop_10(y);
            }
            return Promise.all(promises);
        };
        /**
         * TODO memoize
         * @param color (in hex form)
         */
        SpriteRenderer.prototype._drawEllipse = function (_a, color) {
            var _this = this;
            var x = _a.x, y = _a.y;
            var _b = this._gridToPixel({ x: x, y: y }), left = _b.x, top = _b.y;
            return ImageUtils_4.loadImage(SHADOW_FILENAME)
                .then(function (imageData) { return ImageUtils_4.applyTransparentColor(imageData, Colors_5.default.WHITE); })
                .then(function (imageData) {
                var _a;
                return ImageUtils_4.replaceColors(imageData, (_a = {}, _a[Colors_5.default.BLACK] = color, _a));
            })
                .then(createImageBitmap)
                .then(function (imageBitmap) {
                _this._bufferContext.drawImage(imageBitmap, left, top);
            });
        };
        SpriteRenderer.prototype._renderInventory = function () {
            var _this = this;
            var playerUnit = jwb.state.playerUnit;
            var inventory = playerUnit.inventory;
            var _a = this, _bufferCanvas = _a._bufferCanvas, _bufferContext = _a._bufferContext;
            return ImageUtils_4.loadImage(INVENTORY_BACKGROUND_FILENAME)
                .then(createImageBitmap)
                .then(function (imageBitmap) { return _this._bufferContext.drawImage(imageBitmap, INVENTORY_LEFT, INVENTORY_TOP, INVENTORY_WIDTH, INVENTORY_HEIGHT); })
                .then(function () {
                // draw equipment
                var equipmentLeft = INVENTORY_LEFT + TILE_WIDTH;
                var inventoryLeft = (_bufferCanvas.width + TILE_WIDTH) / 2;
                var promises = [];
                promises.push(_this._drawText('EQUIPMENT', FontRenderer_1.Fonts.PERFECT_DOS_VGA, { x: _bufferCanvas.width / 4, y: INVENTORY_TOP + 12 }, Colors_5.default.WHITE, 'center'));
                promises.push(_this._drawText('INVENTORY', FontRenderer_1.Fonts.PERFECT_DOS_VGA, { x: _bufferCanvas.width * 3 / 4, y: INVENTORY_TOP + 12 }, Colors_5.default.WHITE, 'center'));
                // draw equipment items
                // for now, just display them all in one list
                var y = INVENTORY_TOP + 64;
                playerUnit.equipment.getEntries().forEach(function (_a) {
                    var slot = _a[0], equipment = _a[1];
                    promises.push(_this._drawText(slot + " - " + equipment.name, FontRenderer_1.Fonts.PERFECT_DOS_VGA, { x: equipmentLeft, y: y }, Colors_5.default.WHITE, 'left'));
                    y += LINE_HEIGHT;
                });
                // draw inventory categories
                var inventoryCategories = Object.values(types_8.ItemCategory);
                var categoryWidth = 60;
                var xOffset = 4;
                for (var i = 0; i < inventoryCategories.length; i++) {
                    var x = inventoryLeft + i * categoryWidth + (categoryWidth / 2) + xOffset;
                    var top_3 = INVENTORY_TOP + 40;
                    promises.push(_this._drawText(inventoryCategories[i], FontRenderer_1.Fonts.PERFECT_DOS_VGA, { x: x, y: top_3 }, Colors_5.default.WHITE, 'center'));
                    if (inventoryCategories[i] === inventory.selectedCategory) {
                        _bufferContext.fillStyle = Colors_5.default.WHITE;
                        _bufferContext.fillRect(x - (categoryWidth / 2) + 4, INVENTORY_TOP + 54, categoryWidth - 8, 1);
                    }
                }
                // draw inventory items
                if (inventory.selectedCategory) {
                    var items = inventory.get(inventory.selectedCategory);
                    var x = inventoryLeft + 8;
                    for (var i = 0; i < items.length; i++) {
                        var y_1 = INVENTORY_TOP + 64 + LINE_HEIGHT * i;
                        var color = void 0;
                        if (items[i] === inventory.selectedItem) {
                            color = Colors_5.default.YELLOW;
                        }
                        else {
                            color = Colors_5.default.WHITE;
                        }
                        promises.push(_this._drawText(items[i].name, FontRenderer_1.Fonts.PERFECT_DOS_VGA, { x: x, y: y_1 }, color, 'left'));
                    }
                }
                return Promise.all(promises);
            });
        };
        SpriteRenderer.prototype._isPixelOnScreen = function (_a) {
            var x = _a.x, y = _a.y;
            return ((x >= -TILE_WIDTH) &&
                (x <= SCREEN_WIDTH + TILE_WIDTH) &&
                (y >= -TILE_HEIGHT) &&
                (y <= SCREEN_HEIGHT + TILE_HEIGHT));
        };
        SpriteRenderer.prototype._renderElement = function (element, _a) {
            var x = _a.x, y = _a.y;
            var pixel = this._gridToPixel({ x: x, y: y });
            if (this._isPixelOnScreen(pixel)) {
                var sprite = element.sprite;
                if (!!sprite) {
                    return this._drawSprite(sprite, pixel);
                }
            }
            return PromiseUtils_7.resolvedPromise();
        };
        SpriteRenderer.prototype._drawSprite = function (sprite, _a) {
            var _this = this;
            var x = _a.x, y = _a.y;
            return sprite.getImage()
                .then(function (image) { return _this._bufferContext.drawImage(image, x + sprite.dx, y + sprite.dy); });
        };
        SpriteRenderer.prototype._renderHUD = function () {
            var _this = this;
            return this._renderHUDFrame()
                .then(function () { return Promise.all([
                _this._renderHUDLeftPanel(),
                _this._renderHUDMiddlePanel(),
                _this._renderHUDRightPanel(),
            ]); });
        };
        SpriteRenderer.prototype._renderHUDFrame = function () {
            var _this = this;
            return ImageUtils_4.loadImage(HUD_FILENAME)
                .then(createImageBitmap)
                .then(function (imageBitmap) { return _this._bufferContext.drawImage(imageBitmap, 0, SCREEN_HEIGHT - HUD_HEIGHT); });
        };
        /**
         * Renders the bottom-left area of the screen, showing information about the player
         */
        SpriteRenderer.prototype._renderHUDLeftPanel = function () {
            var playerUnit = jwb.state.playerUnit;
            var lines = [
                playerUnit.name,
                "Level " + playerUnit.level,
                "Life: " + playerUnit.life + "/" + playerUnit.maxLife,
                "Damage: " + playerUnit.getDamage(),
            ];
            var left = HUD_MARGIN;
            var top = SCREEN_HEIGHT - HUD_HEIGHT + HUD_MARGIN;
            var promises = [];
            for (var i = 0; i < lines.length; i++) {
                var y = top + (LINE_HEIGHT * i);
                promises.push(this._drawText(lines[i], FontRenderer_1.Fonts.PERFECT_DOS_VGA, { x: left, y: y }, Colors_5.default.WHITE, 'left'));
            }
            return Promise.all(promises);
        };
        SpriteRenderer.prototype._renderHUDMiddlePanel = function () {
            var _bufferContext = this._bufferContext;
            var messages = jwb.state.messages;
            _bufferContext.fillStyle = Colors_5.default.BLACK;
            _bufferContext.strokeStyle = Colors_5.default.WHITE;
            var left = HUD_LEFT_WIDTH + HUD_MARGIN;
            var top = SCREEN_HEIGHT - HUD_HEIGHT + HUD_MARGIN;
            var promises = [];
            for (var i = 0; i < messages.length; i++) {
                var y = top + (LINE_HEIGHT * i);
                promises.push(this._drawText(messages[i], FontRenderer_1.Fonts.PERFECT_DOS_VGA, { x: left, y: y }, Colors_5.default.WHITE, 'left'));
            }
            return Promise.all(promises);
        };
        SpriteRenderer.prototype._renderHUDRightPanel = function () {
            var _a = jwb.state, mapIndex = _a.mapIndex, playerUnit = _a.playerUnit, turn = _a.turn;
            var left = SCREEN_WIDTH - HUD_RIGHT_WIDTH + HUD_MARGIN;
            var top = SCREEN_HEIGHT - HUD_HEIGHT + HUD_MARGIN;
            var lines = [
                "Turn: " + turn,
                "Floor: " + ((mapIndex || 0) + 1),
            ];
            var experienceToNextLevel = playerUnit.experienceToNextLevel();
            if (experienceToNextLevel !== null) {
                lines.push("Experience: " + playerUnit.experience + "/" + experienceToNextLevel);
            }
            var promises = [];
            for (var i = 0; i < lines.length; i++) {
                var y = top + (LINE_HEIGHT * i);
                promises.push(this._drawText(lines[i], FontRenderer_1.Fonts.PERFECT_DOS_VGA, { x: left, y: y }, Colors_5.default.WHITE, 'left'));
            }
            return Promise.all(promises);
        };
        SpriteRenderer.prototype._drawRect = function (_a) {
            var left = _a.left, top = _a.top, width = _a.width, height = _a.height;
            var _bufferContext = this._bufferContext;
            _bufferContext.fillStyle = Colors_5.default.BLACK;
            _bufferContext.fillRect(left, top, width, height);
            _bufferContext.strokeStyle = Colors_5.default.WHITE;
            _bufferContext.strokeRect(left, top, width, height);
        };
        /**
         * @return the top left pixel
         */
        SpriteRenderer.prototype._gridToPixel = function (_a) {
            var x = _a.x, y = _a.y;
            var playerUnit = jwb.state.playerUnit;
            return {
                x: ((x - playerUnit.x) * TILE_WIDTH) + (SCREEN_WIDTH - TILE_WIDTH) / 2,
                y: ((y - playerUnit.y) * TILE_HEIGHT) + (SCREEN_HEIGHT - TILE_HEIGHT) / 2
            };
        };
        SpriteRenderer.prototype._renderSplashScreen = function (filename, text) {
            var _this = this;
            return ImageUtils_4.loadImage(filename)
                .then(function (imageData) { return createImageBitmap(imageData); })
                .then(function (image) { return _this._bufferContext.drawImage(image, 0, 0, _this._bufferCanvas.width, _this._bufferCanvas.height); })
                .then(function () { return _this._drawText(text, FontRenderer_1.Fonts.PERFECT_DOS_VGA, { x: 320, y: 300 }, Colors_5.default.WHITE, 'center'); });
        };
        SpriteRenderer.prototype._drawText = function (text, font, _a, color, textAlign) {
            var _this = this;
            var x = _a.x, y = _a.y;
            return this._fontRenderer.render(text, font, color)
                .then(function (imageBitmap) {
                var left;
                switch (textAlign) {
                    case 'left':
                        left = x;
                        break;
                    case 'center':
                        left = Math.floor(x - imageBitmap.width / 2);
                        break;
                    case 'right':
                        left = x + imageBitmap.width;
                        break;
                    default:
                        throw 'fux';
                }
                _this._bufferContext.drawImage(imageBitmap, left, y);
                return PromiseUtils_7.resolvedPromise();
            });
        };
        return SpriteRenderer;
    }());
    exports.default = SpriteRenderer;
});
define("items/equipment/EquipmentClasses", ["require", "exports", "types/types", "graphics/sprites/SpriteFactory", "types/Colors"], function (require, exports, types_9, SpriteFactory_2, Colors_6) {
    "use strict";
    var _a, _b, _c, _d, _e;
    Object.defineProperty(exports, "__esModule", { value: true });
    var BRONZE_SWORD = {
        name: 'Bronze Sword',
        char: 'S',
        itemCategory: types_9.ItemCategory.WEAPON,
        equipmentCategory: types_9.EquipmentSlot.MELEE_WEAPON,
        mapIcon: SpriteFactory_2.default.MAP_SWORD,
        paletteSwaps: (_a = {},
            _a[Colors_6.default.BLACK] = Colors_6.default.BLACK,
            _a[Colors_6.default.DARK_GRAY] = Colors_6.default.LIGHT_BROWN,
            _a[Colors_6.default.LIGHT_GRAY] = Colors_6.default.LIGHT_BROWN,
            _a),
        damage: 2,
        minLevel: 1,
        maxLevel: 2
    };
    var IRON_SWORD = {
        name: 'Iron Sword',
        char: 'S',
        itemCategory: types_9.ItemCategory.WEAPON,
        equipmentCategory: types_9.EquipmentSlot.MELEE_WEAPON,
        mapIcon: SpriteFactory_2.default.MAP_SWORD,
        paletteSwaps: (_b = {},
            _b[Colors_6.default.DARK_GRAY] = Colors_6.default.BLACK,
            _b[Colors_6.default.LIGHT_GRAY] = Colors_6.default.DARK_GRAY,
            _b),
        damage: 4,
        minLevel: 3,
        maxLevel: 4
    };
    var STEEL_SWORD = {
        name: 'Steel Sword',
        char: 'S',
        itemCategory: types_9.ItemCategory.WEAPON,
        equipmentCategory: types_9.EquipmentSlot.MELEE_WEAPON,
        mapIcon: SpriteFactory_2.default.MAP_SWORD,
        paletteSwaps: (_c = {},
            _c[Colors_6.default.DARK_GRAY] = Colors_6.default.DARK_GRAY,
            _c[Colors_6.default.LIGHT_GRAY] = Colors_6.default.LIGHT_GRAY,
            _c),
        damage: 6,
        minLevel: 4,
        maxLevel: 6
    };
    var FIRE_SWORD = {
        name: 'Fire Sword',
        char: 'S',
        itemCategory: types_9.ItemCategory.WEAPON,
        equipmentCategory: types_9.EquipmentSlot.MELEE_WEAPON,
        mapIcon: SpriteFactory_2.default.MAP_SWORD,
        paletteSwaps: (_d = {},
            _d[Colors_6.default.DARK_GRAY] = Colors_6.default.YELLOW,
            _d[Colors_6.default.LIGHT_GRAY] = Colors_6.default.RED,
            _d[Colors_6.default.BLACK] = Colors_6.default.DARK_RED,
            _d),
        damage: 8,
        minLevel: 5,
        maxLevel: 6
    };
    var SHORT_BOW = {
        name: 'Short Bow',
        char: 'S',
        itemCategory: types_9.ItemCategory.WEAPON,
        equipmentCategory: types_9.EquipmentSlot.RANGED_WEAPON,
        mapIcon: SpriteFactory_2.default.MAP_BOW,
        paletteSwaps: {},
        damage: 2,
        minLevel: 2,
        maxLevel: 4
    };
    var LONG_BOW = {
        name: 'Long Bow',
        char: 'S',
        itemCategory: types_9.ItemCategory.WEAPON,
        equipmentCategory: types_9.EquipmentSlot.RANGED_WEAPON,
        mapIcon: SpriteFactory_2.default.MAP_BOW,
        paletteSwaps: (_e = {},
            _e[Colors_6.default.DARK_GREEN] = Colors_6.default.DARK_RED,
            _e[Colors_6.default.GREEN] = Colors_6.default.RED,
            _e),
        damage: 4,
        minLevel: 5,
        maxLevel: 6
    };
    function getWeaponClasses() {
        return [BRONZE_SWORD, IRON_SWORD, STEEL_SWORD, FIRE_SWORD, SHORT_BOW, LONG_BOW];
    }
    exports.getWeaponClasses = getWeaponClasses;
});
define("items/ItemFactory", ["require", "exports", "sounds/Sounds", "items/InventoryItem", "items/MapItem", "graphics/sprites/SpriteFactory", "utils/PromiseUtils", "utils/RandomUtils", "items/equipment/EquipmentClasses", "types/types", "sounds/SoundFX", "graphics/animations/Animations"], function (require, exports, Sounds_4, InventoryItem_1, MapItem_1, SpriteFactory_3, PromiseUtils_8, RandomUtils_6, EquipmentClasses_1, types_10, SoundFX_4, Animations_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createPotion(lifeRestored) {
        var onUse = function (item, unit) {
            return new Promise(function (resolve) {
                SoundFX_4.playSound(Sounds_4.default.USE_POTION);
                var prevLife = unit.life;
                unit.life = Math.min(unit.life + lifeRestored, unit.maxLife);
                jwb.state.messages.push(unit.name + " used " + item.name);
                jwb.state.messages.push("and gained " + (unit.life - prevLife) + " life.");
                resolve();
            });
        };
        return new InventoryItem_1.default('Potion', types_10.ItemCategory.POTION, onUse);
    }
    function _equipEquipment(equipmentClass, item, unit) {
        return new Promise(function (resolve) {
            var equippedItem = {
                name: equipmentClass.name,
                slot: equipmentClass.equipmentCategory,
                inventoryItem: item,
                damage: equipmentClass.damage
            };
            unit.equipment.add(equippedItem);
            resolve();
        });
    }
    function createScrollOfFloorFire(damage) {
        var onUse = function (item, unit) {
            var map = jwb.state.getMap();
            var promises = [];
            var adjacentUnits = map.units.filter(function (u) {
                var dx = unit.x - u.x;
                var dy = unit.y - u.y;
                return ([-1, 0, 1].indexOf(dx) > -1)
                    && ([-1, 0, 1].indexOf(dy) > -1)
                    && !(dx === 0 && dy === 0);
            });
            promises.push(function () { return Animations_2.playFloorFireAnimation(unit, adjacentUnits); });
            adjacentUnits.forEach(function (u) {
                promises.push(function () { return u.takeDamage(damage, unit); });
            });
            return PromiseUtils_8.chainPromises(promises);
        };
        return new InventoryItem_1.default('Scroll of Floor Fire', types_10.ItemCategory.SCROLL, onUse);
    }
    function _createInventoryWeapon(weaponClass) {
        var onUse = function (item, unit) { return _equipEquipment(weaponClass, item, unit); };
        return new InventoryItem_1.default(weaponClass.name, weaponClass.itemCategory, onUse);
    }
    function _createMapEquipment(equipmentClass, _a) {
        var x = _a.x, y = _a.y;
        var sprite = equipmentClass.mapIcon(equipmentClass.paletteSwaps);
        var inventoryItem = _createInventoryWeapon(equipmentClass);
        return new MapItem_1.default({ x: x, y: y }, equipmentClass.char, sprite, inventoryItem);
    }
    function _getItemSuppliers(level) {
        var createMapPotion = function (_a) {
            var x = _a.x, y = _a.y;
            var sprite = SpriteFactory_3.default.MAP_POTION();
            var inventoryItem = createPotion(40);
            return new MapItem_1.default({ x: x, y: y }, 'K', sprite, inventoryItem);
        };
        var createFloorFireScroll = function (_a) {
            var x = _a.x, y = _a.y;
            var sprite = SpriteFactory_3.default.MAP_SCROLL();
            var inventoryItem = createScrollOfFloorFire(80);
            return new MapItem_1.default({ x: x, y: y }, 'K', sprite, inventoryItem);
        };
        return [createMapPotion, createFloorFireScroll];
    }
    function _getWeaponSuppliers(level) {
        return EquipmentClasses_1.getWeaponClasses()
            .filter(function (weaponClass) { return level >= weaponClass.minLevel; })
            .filter(function (weaponClass) { return level <= weaponClass.maxLevel; })
            .map(function (weaponClass) { return function (_a) {
            var x = _a.x, y = _a.y;
            return _createMapEquipment(weaponClass, { x: x, y: y });
        }; });
    }
    function createRandomItem(_a, level) {
        var x = _a.x, y = _a.y;
        var suppliers = __spreadArrays(_getItemSuppliers(level), _getWeaponSuppliers(level));
        return RandomUtils_6.randChoice(suppliers)({ x: x, y: y });
    }
    exports.default = {
        createRandomItem: createRandomItem
    };
});
define("units/UnitClasses", ["require", "exports", "graphics/sprites/SpriteFactory", "types/Colors", "types/types", "units/UnitAI"], function (require, exports, SpriteFactory_4, Colors_7, types_11, UnitAI_1) {
    "use strict";
    var _a, _b;
    Object.defineProperty(exports, "__esModule", { value: true });
    var PLAYER = {
        name: 'PLAYER',
        type: types_11.UnitType.HUMAN,
        sprite: SpriteFactory_4.default.PLAYER,
        // Green/brown colors
        paletteSwaps: (_a = {},
            _a[Colors_7.default.DARK_PURPLE] = Colors_7.default.DARK_BROWN,
            _a[Colors_7.default.MAGENTA] = Colors_7.default.DARK_GREEN,
            _a[Colors_7.default.DARK_BLUE] = Colors_7.default.DARK_GREEN,
            _a[Colors_7.default.CYAN] = Colors_7.default.LIGHT_PINK,
            _a[Colors_7.default.BLACK] = Colors_7.default.BLACK,
            _a[Colors_7.default.DARK_GRAY] = Colors_7.default.DARK_BROWN,
            _a[Colors_7.default.LIGHT_GRAY] = Colors_7.default.LIGHT_BROWN,
            _a[Colors_7.default.DARK_GREEN] = Colors_7.default.DARK_BROWN,
            _a[Colors_7.default.GREEN] = Colors_7.default.DARK_BROWN,
            _a[Colors_7.default.ORANGE] = Colors_7.default.LIGHT_PINK // Face
        ,
            _a),
        startingLife: 100,
        startingMana: 100,
        startingDamage: 10,
        minLevel: 1,
        maxLevel: 20,
        lifePerLevel: function (level) { return 10; },
        manaPerLevel: function (level) { return 0; },
        damagePerLevel: function (level) { return 1; },
        experienceToNextLevel: function (currentLevel) { return (currentLevel < 10) ? 2 * currentLevel + 2 : null; },
    };
    var ENEMY_SNAKE = {
        name: 'ENEMY_SNAKE',
        type: types_11.UnitType.ANIMAL,
        sprite: SpriteFactory_4.default.SNAKE,
        paletteSwaps: {},
        startingLife: 40,
        startingMana: null,
        startingDamage: 4,
        minLevel: 1,
        maxLevel: 2,
        lifePerLevel: function () { return 15; },
        manaPerLevel: function () { return null; },
        damagePerLevel: function () { return 1; },
        aiHandler: UnitAI_1.HUMAN_DETERMINISTIC,
        aiParams: {
            speed: 0.95,
            visionRange: 10,
            fleeThreshold: 0.2
        }
    };
    var ENEMY_GRUNT = {
        name: 'ENEMY_GRUNT',
        type: types_11.UnitType.HUMAN,
        sprite: SpriteFactory_4.default.GRUNT,
        paletteSwaps: {},
        startingLife: 50,
        startingMana: null,
        startingDamage: 5,
        minLevel: 1,
        maxLevel: 4,
        lifePerLevel: function () { return 20; },
        manaPerLevel: function () { return null; },
        damagePerLevel: function () { return 1; },
        aiHandler: UnitAI_1.HUMAN_DETERMINISTIC,
        aiParams: {
            speed: 0.90,
            visionRange: 8,
            fleeThreshold: 0.1
        }
    };
    var ENEMY_SOLDIER = {
        name: 'ENEMY_SOLDIER',
        type: types_11.UnitType.HUMAN,
        sprite: SpriteFactory_4.default.SOLDIER,
        paletteSwaps: {},
        startingLife: 60,
        startingMana: null,
        startingDamage: 6,
        minLevel: 3,
        maxLevel: 6,
        lifePerLevel: function () { return 20; },
        manaPerLevel: function () { return null; },
        damagePerLevel: function () { return 2; },
        aiHandler: UnitAI_1.HUMAN_DETERMINISTIC,
        aiParams: {
            speed: 0.90,
            visionRange: 10,
            fleeThreshold: 0.1
        }
    };
    var ENEMY_GOLEM = {
        name: 'ENEMY_GOLEM',
        type: types_11.UnitType.GOLEM,
        sprite: SpriteFactory_4.default.GOLEM,
        paletteSwaps: (_b = {},
            _b[Colors_7.default.DARK_GRAY] = Colors_7.default.DARKER_GRAY,
            _b[Colors_7.default.LIGHT_GRAY] = Colors_7.default.DARKER_GRAY,
            _b),
        startingLife: 80,
        startingMana: null,
        startingDamage: 10,
        minLevel: 5,
        maxLevel: 9,
        lifePerLevel: function () { return 20; },
        manaPerLevel: function () { return null; },
        damagePerLevel: function () { return 2; },
        aiHandler: UnitAI_1.HUMAN_DETERMINISTIC,
        aiParams: {
            speed: 0.88,
            visionRange: 12,
            fleeThreshold: 0
        }
    };
    function getEnemyClasses() {
        return [ENEMY_SNAKE, ENEMY_GRUNT, ENEMY_SOLDIER, ENEMY_GOLEM];
    }
    exports.default = {
        PLAYER: PLAYER,
        ENEMY_GRUNT: ENEMY_GRUNT,
        ENEMY_GOLEM: ENEMY_GOLEM,
        getEnemyClasses: getEnemyClasses
    };
});
define("units/UnitFactory", ["require", "exports", "units/UnitClasses", "utils/RandomUtils", "units/Unit"], function (require, exports, UnitClasses_1, RandomUtils_7, Unit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createRandomEnemy(_a, level) {
        var x = _a.x, y = _a.y;
        var candidates = UnitClasses_1.default.getEnemyClasses()
            .filter(function (unitClass) { return level >= unitClass.minLevel; })
            .filter(function (unitClass) { return level <= unitClass.maxLevel; });
        var unitClass = RandomUtils_7.randChoice(candidates);
        return new Unit_1.default(unitClass, unitClass.name, level, { x: x, y: y });
    }
    exports.default = {
        createRandomEnemy: createRandomEnemy
    };
});
define("maps/generation/DungeonGenerator", ["require", "exports", "maps/MapBuilder", "types/types", "maps/MapUtils", "utils/ArrayUtils"], function (require, exports, MapBuilder_1, types_12, MapUtils_5, ArrayUtils_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DungeonGenerator = /** @class */ (function () {
        function DungeonGenerator(tileSet) {
            this._tileSet = tileSet;
        }
        DungeonGenerator.prototype.generateDungeon = function (level, width, height, numEnemies, enemyUnitSupplier, numItems, itemSupplier) {
            var _this = this;
            var t1 = new Date().getTime();
            var section = this.generateTiles(width, height);
            var t2 = new Date().getTime();
            var tileTypes = section.tiles;
            var stairsLocation = MapUtils_5.pickUnoccupiedLocations(tileTypes, [types_12.TileType.FLOOR], [], 1)[0];
            tileTypes[stairsLocation.y][stairsLocation.x] = types_12.TileType.STAIRS_DOWN;
            var enemyUnitLocations = MapUtils_5.pickUnoccupiedLocations(tileTypes, [types_12.TileType.FLOOR], [stairsLocation], numEnemies);
            var playerUnitLocation = this._pickPlayerLocation(tileTypes, __spreadArrays([stairsLocation], enemyUnitLocations))[0];
            var itemLocations = MapUtils_5.pickUnoccupiedLocations(tileTypes, [types_12.TileType.FLOOR], __spreadArrays([stairsLocation, playerUnitLocation], enemyUnitLocations), numItems);
            var tiles = tileTypes.map(function (row) {
                return row.map(function (tileType) { return MapUtils_5.createTile(tileType, _this._tileSet); });
            });
            var t3 = new Date().getTime();
            console.log("Generated dungeon " + level + " in " + (t3 - t1) + " (" + (t2 - t1) + ", " + (t3 - t2) + ") ms");
            return new MapBuilder_1.default(level, width, height, tiles, section.rooms, playerUnitLocation, enemyUnitLocations, enemyUnitSupplier, itemLocations, itemSupplier);
        };
        /**
         * Spawn the player at the tile that maximizes average distance from enemies and the level exit.
         */
        DungeonGenerator.prototype._pickPlayerLocation = function (tiles, blockedTiles) {
            var candidates = [];
            var _loop_12 = function (y) {
                var _loop_13 = function (x) {
                    if (!MapUtils_5.isBlocking(tiles[y][x]) && !blockedTiles.some(function (tile) { return MapUtils_5.coordinatesEquals(tile, { x: x, y: y }); })) {
                        var tileDistances = blockedTiles.map(function (blockedTile) { return MapUtils_5.hypotenuse({ x: x, y: y }, blockedTile); });
                        candidates.push([{ x: x, y: y }, ArrayUtils_3.average(tileDistances)]);
                    }
                };
                for (var x = 0; x < tiles[y].length; x++) {
                    _loop_13(x);
                }
            };
            for (var y = 0; y < tiles.length; y++) {
                _loop_12(y);
            }
            console.assert(candidates.length > 0);
            return candidates.sort(function (a, b) { return (b[1] - a[1]); })[0];
        };
        return DungeonGenerator;
    }());
    exports.default = DungeonGenerator;
});
define("maps/generation/TileEligibilityChecker", ["require", "exports", "types/types", "maps/MapUtils"], function (require, exports, types_13, MapUtils_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TileEligibilityChecker = /** @class */ (function () {
        function TileEligibilityChecker() {
        }
        TileEligibilityChecker.prototype.isBlocked = function (_a, section, exits) {
            var x = _a.x, y = _a.y;
            // can't draw a path through an existing room or a wall
            var blockedTileTypes = [types_13.TileType.FLOOR, /*TileType.FLOOR_HALL,*/ types_13.TileType.WALL, types_13.TileType.WALL_HALL, types_13.TileType.WALL_TOP];
            if (exits.some(function (exit) { return MapUtils_6.coordinatesEquals({ x: x, y: y }, exit); })) {
                return false;
            }
            else if (section.tiles[y][x] === types_13.TileType.NONE || section.tiles[y][x] === types_13.TileType.FLOOR_HALL) {
                // skip the check if we're within 1 tile vertically of an exit
                var isNextToExit = [-2, -1, 1, 2].some(function (dy) { return (exits.some(function (exit) { return MapUtils_6.coordinatesEquals(exit, { x: x, y: y + dy }); })); });
                if (isNextToExit) {
                    return false;
                }
                // can't draw tiles within 2 tiles vertically of a wall tile, or a room floor tile
                for (var _i = 0, _b = [-2, -1, 1, 2]; _i < _b.length; _i++) {
                    var dy = _b[_i];
                    if ((y + dy >= 0) && (y + dy < section.height)) {
                        var tile = section.tiles[y + dy][x];
                        if (blockedTileTypes.indexOf(tile) > -1) {
                            return true;
                        }
                    }
                }
                return false;
            }
            else if (blockedTileTypes.indexOf(section.tiles[y][x]) > -1) {
                return true;
            }
            console.error('how\'d we get here?');
            return true;
        };
        return TileEligibilityChecker;
    }());
    exports.default = TileEligibilityChecker;
});
define("maps/generation/RoomCorridorDungeonGenerator", ["require", "exports", "maps/generation/DungeonGenerator", "utils/Pathfinder", "maps/generation/TileEligibilityChecker", "types/types", "utils/RandomUtils", "utils/ArrayUtils", "maps/MapUtils"], function (require, exports, DungeonGenerator_1, Pathfinder_2, TileEligibilityChecker_1, types_14, RandomUtils_8, ArrayUtils_4, MapUtils_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Based on http://www.roguebasin.com/index.php?title=Basic_BSP_Dungeon_generation
     */
    var RoomCorridorDungeonGenerator = /** @class */ (function (_super) {
        __extends(RoomCorridorDungeonGenerator, _super);
        /**
         * @param minRoomDimension outer width, including wall
         * @param maxRoomDimension outer width, including wall
         * @param minRoomPadding minimum padding between each room and its containing section
         */
        function RoomCorridorDungeonGenerator(tileSet, minRoomDimension, maxRoomDimension, minRoomPadding) {
            var _this = _super.call(this, tileSet) || this;
            _this._minRoomDimension = minRoomDimension;
            _this._maxRoomDimension = maxRoomDimension;
            _this._minRoomPadding = minRoomPadding;
            return _this;
        }
        RoomCorridorDungeonGenerator.prototype.generateTiles = function (width, height) {
            var _this = this;
            // Create a section with dimensions (width, height - 1) and then shift it down by one tile.
            // This is so we have room to add a WALL_TOP tile in the top slot if necessary
            var section = (function () {
                var section = _this._generateSection(width, height - 1);
                var connectedRoomPairs = _this._joinSection(section, [], true);
                _this._joinSection(section, connectedRoomPairs, false);
                return _this._shiftVertically(section, 1);
            })();
            this._addWalls(section);
            return section;
        };
        /**
         * Generate a rectangular area of tiles with the specified dimensions, consisting of any number of rooms connected
         * by corridors.  To do so, split the area into two sub-areas and call this method recursively.  If this area is
         * not large enough to form two sub-regions, just return a single section.
         */
        RoomCorridorDungeonGenerator.prototype._generateSection = function (width, height) {
            var splitDirection = this._getSplitDirection(width, height);
            if (splitDirection === 'HORIZONTAL') {
                var splitX_1 = this._getSplitPoint(width);
                var leftWidth = splitX_1;
                var leftSection = this._generateSection(leftWidth, height);
                var rightWidth = width - splitX_1;
                var rightSection = this._generateSection(rightWidth, height);
                var tiles = [];
                for (var y = 0; y < leftSection.tiles.length; y++) {
                    var row = __spreadArrays(leftSection.tiles[y], rightSection.tiles[y]);
                    tiles.push(row);
                }
                // rightSection.rooms are relative to its own origin, we need to offset them by rightSection's coordinates
                // relative to this section's coordinates
                var rightRooms = rightSection.rooms
                    .map(function (room) { return (__assign(__assign({}, room), { left: room.left + splitX_1 })); });
                return {
                    width: width,
                    height: height,
                    rooms: __spreadArrays(leftSection.rooms, rightRooms),
                    tiles: tiles
                };
            }
            else if (splitDirection === 'VERTICAL') {
                var splitY_1 = this._getSplitPoint(height);
                var topHeight = splitY_1;
                var bottomHeight = height - splitY_1;
                var topSection = this._generateSection(width, topHeight);
                var bottomSection = this._generateSection(width, bottomHeight);
                var tiles = __spreadArrays(topSection.tiles, bottomSection.tiles);
                var bottomRooms = bottomSection.rooms
                    .map(function (room) { return (__assign(__assign({}, room), { top: room.top + splitY_1 })); });
                return {
                    width: width,
                    height: height,
                    rooms: __spreadArrays(topSection.rooms, bottomRooms),
                    tiles: tiles
                };
            }
            else {
                // Base case: return a single section
                return this._generateSingleSection(width, height);
            }
        };
        RoomCorridorDungeonGenerator.prototype._getSplitDirection = function (width, height) {
            // First, make sure the area is large enough to support two sections; if not, we're done
            var minSectionDimension = this._minRoomDimension + (2 * this._minRoomPadding);
            var canSplitHorizontally = (width >= (2 * minSectionDimension));
            var canSplitVertically = (height >= (2 * minSectionDimension));
            // @ts-ignore
            var splitDirections = __spreadArrays((canSplitHorizontally ? ['HORIZONTAL'] : []), (canSplitVertically ? ['VERTICAL'] : []), ((!canSplitHorizontally && !canSplitVertically) ? ['NONE'] : []));
            if (splitDirections.length > 0) {
                return RandomUtils_8.randChoice(splitDirections);
            }
            return 'NONE';
        };
        /**
         * Create a rectangular section of tiles, consisting of a room surrounded by empty spaces.  The room can be placed
         * anywhere in the region at random, and can occupy a variable amount of space in the region
         * (within the specified parameters).
         */
        RoomCorridorDungeonGenerator.prototype._generateSingleSection = function (width, height) {
            var maxRoomWidth = Math.min(width - (2 * this._minRoomPadding), this._maxRoomDimension);
            var maxRoomHeight = Math.min(height - (2 * this._minRoomPadding), this._maxRoomDimension);
            console.assert(maxRoomWidth >= this._minRoomDimension && maxRoomHeight >= this._minRoomDimension, 'calculate room dimensions failed');
            var roomWidth = RandomUtils_8.randInt(this._minRoomDimension, maxRoomWidth);
            var roomHeight = RandomUtils_8.randInt(this._minRoomDimension, maxRoomHeight);
            var roomTiles = this._generateRoomTiles(roomWidth, roomHeight);
            var roomLeft = RandomUtils_8.randInt(this._minRoomPadding, width - roomWidth - this._minRoomPadding);
            var roomTop = RandomUtils_8.randInt(this._minRoomPadding, height - roomHeight - this._minRoomPadding);
            var tiles = [];
            // x, y are relative to the section's origin
            // roomX, roomY are relative to the room's origin
            for (var y = 0; y < height; y++) {
                tiles[y] = [];
                var roomY = y - roomTop;
                for (var x = 0; x < width; x++) {
                    var roomX = x - roomLeft;
                    if (roomX >= 0 && roomX < roomWidth && roomY >= 0 && roomY < roomHeight) {
                        tiles[y][x] = roomTiles[roomY][roomX];
                    }
                    else {
                        tiles[y][x] = types_14.TileType.NONE;
                    }
                }
            }
            var room = {
                left: roomLeft,
                top: roomTop,
                width: roomWidth,
                height: roomHeight,
                exits: []
            };
            return { width: width, height: height, rooms: [room], tiles: tiles };
        };
        RoomCorridorDungeonGenerator.prototype._generateRoomTiles = function (width, height) {
            var tiles = [];
            for (var y = 0; y < height; y++) {
                tiles[y] = [];
                for (var x = 0; x < width; x++) {
                    if (x > 0 && x < (width - 1) && y === 0) {
                        tiles[y][x] = types_14.TileType.WALL_TOP;
                    }
                    else if (x === 0 || x === (width - 1) || y === 0 || y === (height - 1)) {
                        tiles[y][x] = types_14.TileType.WALL;
                    }
                    else {
                        tiles[y][x] = types_14.TileType.FLOOR;
                    }
                }
            }
            return tiles;
        };
        /**
         * @param dimension width or height
         * @returns the min X/Y coordinate of the *second* room
         */
        RoomCorridorDungeonGenerator.prototype._getSplitPoint = function (dimension) {
            var minSectionDimension = this._minRoomDimension + 2 * this._minRoomPadding;
            var minSplitPoint = minSectionDimension;
            var maxSplitPoint = dimension - minSectionDimension;
            return RandomUtils_8.randInt(minSplitPoint, maxSplitPoint);
        };
        RoomCorridorDungeonGenerator.prototype._joinSection = function (section, existingRoomPairs, logError) {
            var _this = this;
            var connectedRoomPairs = [];
            var unconnectedRooms = __spreadArrays(section.rooms);
            var connectedRooms = [];
            var nextRoom = unconnectedRooms.pop();
            if (!!nextRoom) {
                connectedRooms.push(nextRoom);
            }
            while (unconnectedRooms.length > 0) {
                var candidatePairs = connectedRooms
                    .flatMap(function (connectedRoom) { return unconnectedRooms.map(function (unconnectedRoom) { return [connectedRoom, unconnectedRoom]; }); })
                    .filter(function (_a) {
                    var connectedRoom = _a[0], unconnectedRoom = _a[1];
                    return !existingRoomPairs.some(function (_a) {
                        var firstExistingRoom = _a[0], secondExistingRoom = _a[1];
                        return (_this._coordinatePairEquals([connectedRoom, unconnectedRoom], [firstExistingRoom, secondExistingRoom]));
                    });
                })
                    .filter(function (_a) {
                    var connectedRoom = _a[0], unconnectedRoom = _a[1];
                    return _this._canJoinRooms(connectedRoom, unconnectedRoom);
                });
                RandomUtils_8.shuffle(candidatePairs);
                var joinedAnyRooms = false;
                for (var _i = 0, candidatePairs_1 = candidatePairs; _i < candidatePairs_1.length; _i++) {
                    var _a = candidatePairs_1[_i], connectedRoom = _a[0], unconnectedRoom = _a[1];
                    if (this._joinRooms(connectedRoom, unconnectedRoom, section)) {
                        connectedRoomPairs.push([connectedRoom, unconnectedRoom]);
                        unconnectedRooms.splice(unconnectedRooms.indexOf(unconnectedRoom), 1);
                        connectedRooms.push(unconnectedRoom);
                        joinedAnyRooms = true;
                        break;
                    }
                }
                if (!joinedAnyRooms) {
                    if (logError) {
                        console.error('Couldn\'t connect rooms!');
                        this._logSections('fux', section);
                        debugger;
                    }
                    break;
                }
            }
            return connectedRoomPairs;
        };
        /**
         * add walls above corridor tiles if possible
         */
        RoomCorridorDungeonGenerator.prototype._addWalls = function (section) {
            for (var y = 0; y < section.height; y++) {
                for (var x = 0; x < section.width; x++) {
                    if (y > 0) {
                        if (section.tiles[y][x] === types_14.TileType.FLOOR_HALL) {
                            if (section.tiles[y - 1][x] === types_14.TileType.NONE || section.tiles[y - 1][x] === types_14.TileType.WALL) {
                                section.tiles[y - 1][x] = types_14.TileType.WALL_HALL;
                            }
                        }
                    }
                }
            }
        };
        RoomCorridorDungeonGenerator.prototype._canJoinRooms = function (first, second) {
            return (first !== second); // && (first.exits.length < MAX_EXITS) && (second.exits.length < MAX_EXITS);
        };
        RoomCorridorDungeonGenerator.prototype._joinRooms = function (firstRoom, secondRoom, section) {
            var firstExitCandidates = this._getExitCandidates(firstRoom);
            var secondExitCandidates = this._getExitCandidates(secondRoom);
            var exitPairs = [];
            for (var _i = 0, firstExitCandidates_1 = firstExitCandidates; _i < firstExitCandidates_1.length; _i++) {
                var firstExit = firstExitCandidates_1[_i];
                for (var _a = 0, secondExitCandidates_1 = secondExitCandidates; _a < secondExitCandidates_1.length; _a++) {
                    var secondExit = secondExitCandidates_1[_a];
                    exitPairs.push([firstExit, secondExit]);
                }
            }
            exitPairs = ArrayUtils_4.sortBy(exitPairs, function (_a) {
                var first = _a[0], second = _a[1];
                return MapUtils_7.hypotenuse(first, second);
            });
            for (var i = 0; i < exitPairs.length; i++) {
                var _b = exitPairs[i], firstExit = _b[0], secondExit = _b[1];
                if (this._joinExits(firstExit, secondExit, section)) {
                    firstRoom.exits.push(firstExit);
                    secondRoom.exits.push(secondExit);
                    return true;
                }
            }
            return false;
        };
        RoomCorridorDungeonGenerator.prototype._getExitCandidates = function (room) {
            var eligibleSides = ['TOP', 'RIGHT', 'BOTTOM', 'LEFT'];
            var candidates = [];
            eligibleSides.forEach(function (side) {
                switch (side) {
                    case 'TOP':
                        for (var x = room.left + 1; x < room.left + room.width - 1; x++) {
                            candidates.push({ x: x, y: room.top });
                        }
                        break;
                    case 'RIGHT':
                        for (var y = room.top + 1; y < room.top + room.height - 1; y++) {
                            candidates.push({ x: room.left + room.width - 1, y: y });
                        }
                        break;
                    case 'BOTTOM':
                        for (var x = room.left + 1; x < room.left + room.width - 1; x++) {
                            candidates.push({ x: x, y: room.top + room.height - 1 });
                        }
                        break;
                    case 'LEFT':
                        for (var y = room.top + 1; y < room.top + room.height - 1; y++) {
                            candidates.push({ x: room.left, y: y });
                        }
                        break;
                    default:
                        throw "Unknown side " + side;
                }
            });
            return candidates.filter(function (_a) {
                var x = _a.x, y = _a.y;
                return !room.exits.some(function (exit) { return MapUtils_7.isAdjacent(exit, { x: x, y: y }); });
            });
        };
        /**
         * Find a path between the specified exits between rooms.
         */
        RoomCorridorDungeonGenerator.prototype._joinExits = function (firstExit, secondExit, section) {
            var _this = this;
            var tileChecker = new TileEligibilityChecker_1.default();
            var unblockedTiles = [];
            for (var y = 0; y < section.height; y++) {
                for (var x = 0; x < section.width; x++) {
                    if (!tileChecker.isBlocked({ x: x, y: y }, section, [firstExit, secondExit])) {
                        unblockedTiles.push({ x: x, y: y });
                    }
                }
            }
            var tileCostCalculator = function (first, second) { return _this._calculateTileCost(section, first, second); };
            var path = new Pathfinder_2.default(tileCostCalculator).findPath(firstExit, secondExit, unblockedTiles);
            path.forEach(function (_a) {
                var x = _a.x, y = _a.y;
                section.tiles[y][x] = types_14.TileType.FLOOR_HALL;
            });
            return (path.length > 0);
        };
        RoomCorridorDungeonGenerator.prototype._calculateTileCost = function (section, first, second) {
            // prefer reusing floor hall tiles
            return (section.tiles[second.y][second.x] === types_14.TileType.FLOOR_HALL) ? 0.5 : 1;
        };
        ;
        RoomCorridorDungeonGenerator.prototype._emptyRow = function (width) {
            var row = [];
            for (var x = 0; x < width; x++) {
                row.push(types_14.TileType.NONE);
            }
            return row;
        };
        RoomCorridorDungeonGenerator.prototype._coordinatePairEquals = function (firstPair, secondPair) {
            // it's ok to use !== here, rooms will be referentially equal
            return ((firstPair[0] === secondPair[0] && firstPair[1] === secondPair[1]) ||
                (firstPair[0] === secondPair[1] && firstPair[1] === secondPair[0]));
        };
        RoomCorridorDungeonGenerator.prototype._logSections = function (name) {
            var sections = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                sections[_i - 1] = arguments[_i];
            }
            console.log("Sections for " + name + ":");
            sections.forEach(function (section) { return console.log(section.tiles
                .map(function (row) { return row.map(function (tile) {
                if (MapUtils_7.isBlocking(tile)) {
                    return '#';
                }
                return '.';
            }).join(''); })
                .join('\n')); });
            console.log();
        };
        RoomCorridorDungeonGenerator.prototype._shiftVertically = function (section, dy) {
            return __assign(__assign({}, section), { rooms: section.rooms.map(function (room) { return ({
                    left: room.left,
                    top: room.top + dy,
                    width: room.width,
                    height: room.height,
                    exits: room.exits.map(function (_a) {
                        var x = _a.x, y = _a.y;
                        return ({ x: x, y: y + dy });
                    })
                }); }), tiles: __spreadArrays([this._emptyRow(section.width)], section.tiles) });
        };
        return RoomCorridorDungeonGenerator;
    }(DungeonGenerator_1.default));
    exports.default = RoomCorridorDungeonGenerator;
});
define("maps/generation/BlobDungeonGenerator", ["require", "exports", "maps/generation/DungeonGenerator", "types/types", "utils/RandomUtils", "maps/MapUtils", "utils/ArrayUtils"], function (require, exports, DungeonGenerator_2, types_15, RandomUtils_9, MapUtils_8, ArrayUtils_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BlobDungeonGenerator = /** @class */ (function (_super) {
        __extends(BlobDungeonGenerator, _super);
        function BlobDungeonGenerator(tileSet) {
            return _super.call(this, tileSet) || this;
        }
        /**
         * Strategy:
         * Add a floor tile near the middle of the map.
         * Until the map is half-full, continue adding new tiles adjacent to existing tiles.
         * New tile placement should be random - but aim for a certain level of "snakiness",
         * where snakiness is defined as the number of tiles within N units
         * (more adjacent tiles - less snaky).
         */
        BlobDungeonGenerator.prototype.generateTiles = function (width, height) {
            var tiles = this._initTiles(width, height);
            this._placeInitialTile(width, height, tiles);
            var targetNumFloorTiles = this._getTargetNumFloorTiles(width * height);
            while (this._getFloorTiles(tiles).length < targetNumFloorTiles) {
                if (!this._addFloorTile(tiles)) {
                    break;
                }
            }
            this._addWalls(tiles);
            return {
                tiles: tiles,
                width: width,
                height: height,
                rooms: []
            };
        };
        BlobDungeonGenerator.prototype._initTiles = function (width, height) {
            var tiles = [];
            for (var y = 0; y < height; y++) {
                var row = [];
                for (var x = 0; x < width; x++) {
                    row.push(types_15.TileType.NONE);
                }
                tiles.push(row);
            }
            return tiles;
        };
        BlobDungeonGenerator.prototype._placeInitialTile = function (width, height, tiles) {
            var x = RandomUtils_9.randInt(width * 3 / 8, width * 5 / 8);
            var y = RandomUtils_9.randInt(height * 3 / 8, height * 5 / 8);
            tiles[y][x] = types_15.TileType.FLOOR;
        };
        BlobDungeonGenerator.prototype._getTargetNumFloorTiles = function (max) {
            var minRatio = 0.4;
            var maxRatio = 0.7;
            return RandomUtils_9.randInt(Math.round(max * minRatio), Math.round(max * maxRatio));
        };
        BlobDungeonGenerator.prototype._getFloorTiles = function (tiles) {
            var floorTiles = [];
            for (var y = 0; y < tiles.length; y++) {
                for (var x = 0; x < tiles[y].length; x++) {
                    if (tiles[y][x] === types_15.TileType.FLOOR) {
                        floorTiles.push({ x: x, y: y });
                    }
                }
            }
            return floorTiles;
        };
        BlobDungeonGenerator.prototype._getEmptyTiles = function (tiles) {
            var floorTiles = [];
            for (var y = 0; y < tiles.length; y++) {
                for (var x = 0; x < tiles[y].length; x++) {
                    if (tiles[y][x] === types_15.TileType.NONE) {
                        floorTiles.push({ x: x, y: y });
                    }
                }
            }
            return floorTiles;
        };
        /**
         * @return whether a tile was successfully added
         */
        BlobDungeonGenerator.prototype._addFloorTile = function (tiles) {
            var _this = this;
            var floorTiles = this._getFloorTiles(tiles);
            var candidates = this._getCandidates(tiles, floorTiles)
                .sort(ArrayUtils_5.comparing(function (tile) { return _this._getSnakeScore(tile, tiles); }));
            if (candidates.length === 0) {
                return false;
            }
            // change these ratios to adjust the "snakiness"
            var minIndex = Math.floor((candidates.length - 1) * 0.6);
            var maxIndex = Math.floor((candidates.length - 1) * 0.8);
            var index = RandomUtils_9.randInt(minIndex, maxIndex);
            var _a = candidates[index], x = _a.x, y = _a.y;
            tiles[y][x] = types_15.TileType.FLOOR;
            return true;
        };
        BlobDungeonGenerator.prototype._getCandidates = function (tiles, floorTiles) {
            var _this = this;
            return this._getEmptyTiles(tiles)
                .filter(function (_a) {
                var x = _a.x, y = _a.y;
                return y > 0;
            })
                .filter(function (_a) {
                var x = _a.x, y = _a.y;
                return _this._isLegalWallCoordinates({ x: x, y: y }, tiles);
            })
                .filter(function (_a) {
                var x = _a.x, y = _a.y;
                return floorTiles.some(function (floorTile) { return MapUtils_8.isAdjacent({ x: x, y: y }, floorTile); });
            });
        };
        BlobDungeonGenerator.prototype._isLegalWallCoordinates = function (_a, tiles) {
            var x = _a.x, y = _a.y;
            // To facilitate wall generation, disallow some specific cases:
            // 1. can't add a floor tile if there's a wall right above it, AND a floor tile right above that
            var height = tiles.length;
            var m = 3; // number of consecutive wall tiles required
            for (var n = 2; n <= m; n++) {
                if (y >= n) {
                    if (this._range(y - (n - 1), y - 1).every(function (y2) { return tiles[y2][x] === types_15.TileType.NONE; })
                        && (tiles[y - n][x] === types_15.TileType.FLOOR)) {
                        return false;
                    }
                }
                // 2. can't add a floor tile if there's a wall right below it, AND a floor tile right below that
                if (y <= (height - 1 - n)) {
                    if (this._range(y + 1, y + (n - 1)).every(function (y2) { return tiles[y2][x] === types_15.TileType.NONE; })
                        && (tiles[y + n][x] == types_15.TileType.FLOOR)) {
                        return false;
                    }
                }
                // 3. check for kitty corner floor tiles
                if (this._hasKittyCornerFloorTile({ x: x, y: y }, tiles)) {
                    return false;
                }
            }
            return true;
        };
        BlobDungeonGenerator.prototype._hasKittyCornerFloorTile = function (_a, tiles) {
            var x = _a.x, y = _a.y;
            var height = tiles.length;
            var width = tiles[0].length;
            // one tile apart vertically
            for (var _i = 0, _b = [[-1, -1], [1, -1], [-1, 1], [1, 1]]; _i < _b.length; _i++) {
                var _c = _b[_i], dx = _c[0], dy = _c[1];
                var _d = [x + dx, y + dy], x2 = _d[0], y2 = _d[1];
                if (x2 < 0 || x2 >= width || y2 < 0 || y2 >= height) {
                    // out of bounds
                }
                else if (tiles[y2][x2] === types_15.TileType.FLOOR) {
                    if (tiles[y2][x] === types_15.TileType.NONE && tiles[y][x2] === types_15.TileType.NONE) {
                        return true;
                    }
                }
            }
            // two tiles apart vertically
            // @X        ab
            // XX        cd
            //  F        ef
            for (var _e = 0, _f = [[-1, -2], [1, -2], [-1, 2], [1, 2]]; _e < _f.length; _e++) {
                var _g = _f[_e], dx = _g[0], dy = _g[1];
                var a = { x: x, y: y };
                var b = { x: x + dx, y: y };
                var c = { x: x, y: y + (dy / 2) };
                var d = { x: x + dx, y: y + (dy / 2) };
                var e = { x: x, y: y + dy };
                var f = { x: x + dx, y: y + dy };
                if (f.x < 0 || f.x >= width || f.y < 0 || f.y >= height) {
                    // out of bounds
                }
                else {
                    if (tiles[b.y][b.x] === types_15.TileType.NONE
                        && tiles[c.y][c.x] === types_15.TileType.NONE
                        && tiles[d.y][d.x] === types_15.TileType.NONE
                        && tiles[f.y][f.x] === types_15.TileType.FLOOR) {
                        return true;
                    }
                }
            }
            return false;
        };
        BlobDungeonGenerator.prototype._addWalls = function (tiles) {
            var height = tiles.length;
            var width = tiles[0].length;
            for (var y = 0; y < (height - 1); y++) {
                for (var x = 0; x < width; x++) {
                    if (tiles[y][x] === types_15.TileType.NONE && tiles[y + 1][x] === types_15.TileType.FLOOR) {
                        tiles[y][x] = types_15.TileType.WALL_TOP;
                    }
                }
            }
        };
        /**
         * @param end inclusive
         */
        BlobDungeonGenerator.prototype._range = function (start, end) {
            var range = [];
            for (var i = start; i <= end; i++) {
                range.push(i);
            }
            return range;
        };
        /**
         * @return the number of nearby tiles
         */
        BlobDungeonGenerator.prototype._getSnakeScore = function (tile, tiles) {
            var score = 0;
            var offset = 1;
            var height = tiles.length;
            var width = tiles[0].length;
            var minY = Math.max(0, tile.y - offset);
            var maxY = Math.min(tile.y + offset, height - 1);
            var minX = Math.max(0, tile.x - offset);
            var maxX = Math.min(tile.x + offset, width - 1);
            for (var y = minY; y <= maxY; y++) {
                for (var x = minX; x <= maxX; x++) {
                    if (MapUtils_8.coordinatesEquals(tile, { x: x, y: y })) {
                        continue;
                    }
                    if (tiles[y][x] === types_15.TileType.FLOOR) {
                        score++;
                    }
                }
            }
            return score;
        };
        return BlobDungeonGenerator;
    }(DungeonGenerator_2.default));
    exports.default = BlobDungeonGenerator;
});
define("maps/MapFactory", ["require", "exports", "items/ItemFactory", "units/UnitFactory", "maps/generation/RoomCorridorDungeonGenerator", "maps/generation/BlobDungeonGenerator", "types/types", "utils/RandomUtils"], function (require, exports, ItemFactory_1, UnitFactory_1, RoomCorridorDungeonGenerator_1, BlobDungeonGenerator_1, types_16, RandomUtils_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createRandomMap(mapLayout, tileSet, level, width, height, numEnemies, numItems) {
        var dungeonGenerator = _getDungeonGenerator(mapLayout, tileSet);
        return dungeonGenerator.generateDungeon(level, width, height, numEnemies, UnitFactory_1.default.createRandomEnemy, numItems, ItemFactory_1.default.createRandomItem);
    }
    function _getDungeonGenerator(mapLayout, tileSet) {
        switch (mapLayout) {
            case types_16.MapLayout.ROOMS_AND_CORRIDORS: {
                var minRoomDimension = RandomUtils_10.randInt(6, 6);
                var maxRoomDimension = RandomUtils_10.randInt(9, 9);
                var minRoomPadding = 0;
                return new RoomCorridorDungeonGenerator_1.default(tileSet, minRoomDimension, maxRoomDimension, minRoomPadding);
            }
            case types_16.MapLayout.BLOB:
                return new BlobDungeonGenerator_1.default(tileSet);
        }
    }
    exports.default = { createRandomMap: createRandomMap };
});
define("maps/TileSets", ["require", "exports", "graphics/ImageSupplier", "types/Colors", "types/types", "graphics/sprites/SpriteFactory"], function (require, exports, ImageSupplier_4, Colors_8, types_17, SpriteFactory_5) {
    "use strict";
    var _a, _b;
    Object.defineProperty(exports, "__esModule", { value: true });
    function _getTileSprite(filename) {
        return function (paletteSwaps) { return SpriteFactory_5.createStaticSprite(new ImageSupplier_4.default(filename, Colors_8.default.WHITE, paletteSwaps), { dx: 0, dy: 0 }); };
    }
    function _mapFilenames(filenames) {
        // @ts-ignore
        var tileSet = {};
        Object.entries(filenames).forEach(function (_a) {
            var tileType = _a[0], filenames = _a[1];
            // @ts-ignore
            tileSet[tileType] = [];
            filenames.forEach(function (filename) {
                var sprite = !!filename ? _getTileSprite(filename)({}) : null;
                // @ts-ignore
                tileSet[tileType].push(sprite);
            });
        });
        return tileSet;
    }
    var dungeonFilenames = (_a = {},
        _a[types_17.TileType.FLOOR] = ['dungeon/tile_floor', 'dungeon/tile_floor_2'],
        _a[types_17.TileType.FLOOR_HALL] = ['dungeon/tile_floor_hall', 'dungeon/tile_floor_hall_2'],
        _a[types_17.TileType.WALL_TOP] = ['dungeon/tile_wall'],
        _a[types_17.TileType.WALL_HALL] = ['dungeon/tile_wall_hall'],
        _a[types_17.TileType.WALL] = [null],
        _a[types_17.TileType.STAIRS_DOWN] = ['stairs_down2'],
        _a[types_17.TileType.NONE] = [null],
        _a);
    var caveFilenames = (_b = {},
        _b[types_17.TileType.FLOOR] = ['cave/tile_floor', 'cave/tile_floor_2'],
        _b[types_17.TileType.FLOOR_HALL] = ['cave/tile_floor', 'cave/tile_floor_2'],
        _b[types_17.TileType.WALL_TOP] = ['cave/tile_wall'],
        _b[types_17.TileType.WALL_HALL] = ['cave/tile_wall'],
        _b[types_17.TileType.WALL] = [null],
        _b[types_17.TileType.STAIRS_DOWN] = ['stairs_down2'],
        _b[types_17.TileType.NONE] = [null],
        _b);
    var TileSets = {
        DUNGEON: _mapFilenames(dungeonFilenames),
        CAVE: _mapFilenames(caveFilenames),
    };
    exports.default = TileSets;
});
define("sounds/Suites", ["require", "exports", "sounds/AudioUtils"], function (require, exports, AudioUtils_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function _duplicate(samples) {
        return __spreadArrays(samples, samples);
    }
    var SUITE_1 = (function () {
        var FIGURE_1 = [[300, 2000], [200, 1000], [225, 1000]];
        var FIGURE_2 = [[300, 1000], [225, 1000], [200, 2000]];
        var FIGURE_3 = [[200, 1000], [225, 1000], [250, 2000]];
        var FIGURE_4 = [[300, 200], [250, 100], [225, 200], [600, 500], [300, 200], [200, 200], [225, 100], [200, 200], [225, 200], [300, 100], [600, 500], [300, 500], [600, 500], [250, 500], [300, 200], [200, 200], [250, 100], [300, 200], [225, 200], [250, 100]];
        var FIGURE_5 = [[600, 500], [225, 250], [250, 250], [500, 500], [600, 500], [400, 500], [250, 500], [200, 250], [225, 250], [300, 250], [400, 250]];
        var FIGURE_6 = [[600, 200], [0, 100], [600, 200], [0, 500], [600, 500], [0, 500]];
        return {
            length: 4000,
            sections: {
                SECTION_A: {
                    bass: [FIGURE_1, FIGURE_6]
                },
                SECTION_B: {
                    bass: [FIGURE_1, FIGURE_2, FIGURE_4],
                    lead: [FIGURE_4, FIGURE_5]
                },
                SECTION_C: {
                    bass: [FIGURE_2, FIGURE_3 /*, FIGURE_4*/],
                    lead: [FIGURE_4]
                },
                SECTION_D: {
                    bass: [FIGURE_3, FIGURE_4, FIGURE_6],
                    lead: [FIGURE_4, FIGURE_5, FIGURE_6],
                }
            }
        };
    })();
    exports.SUITE_1 = SUITE_1;
    var SUITE_2 = (function () {
        var FIGURE_1 = [[100, 1000], [80, 1000], [120, 1000], [80, 1000]]
            .map(AudioUtils_2.transpose8va);
        var FIGURE_2 = [[50, 1000], [80, 1000], [200, 1000], [240, 750], [230, 250]]
            //const FIGURE_2 = [[50,1000],[80,1000],[200,1000],[240,750],[/*230*/225,250]]
            .map(AudioUtils_2.transpose8va)
            .map(AudioUtils_2.transpose8va);
        var FIGURE_3 = [[300, 500], [240, 500], [225, 1000], [200, 750], [150, 250], [180, 1000]];
        // const FIGURE_3 = [[300,500],[/*235*/240,500],[225,1000],[200,750],[150,250],[180,1000]];
        var FIGURE_4 = [[50, 250], [80, 250], [100, 500], [80, 250], [100, 250], [225, 125], [200, 125], [180, 125], [150, 125], [50, 250], [80, 250], [100, 500], [80, 250], [100, 250], [225, 125], [200, 125], [180, 125], [150, 125]]
            .map(AudioUtils_2.transpose8va)
            .map(AudioUtils_2.transpose8va);
        var FIGURE_5 = [[300, 500], [200, 1000], [225, 500], [240, 500], [150, 1000], [100, 250], [180, 250]];
        //const FIGURE_5 = [[300,500],[200,1000],[225,500],[/*235*/240,500],[150,1000],[100,250],[180,250]];
        var FIGURE_6 = [[100, 250], [0, 250], [100, 250], [0, 250], [100, 250], [0, 250], [100, 250], [120, 250], [100, 250], [0, 250], [100, 250], [0, 250], [80, 250], [100, 250], [80, 250], [90, 250]]
            .map(AudioUtils_2.transpose8va);
        return {
            length: 4000,
            sections: {
                SECTION_A: {
                    bass: [FIGURE_1, FIGURE_6]
                },
                SECTION_B: {
                    bass: [FIGURE_1, FIGURE_2, FIGURE_4],
                    lead: [FIGURE_4, FIGURE_5]
                },
                SECTION_C: {
                    bass: [FIGURE_2, FIGURE_3 /*, FIGURE_4*/],
                    lead: [FIGURE_4]
                },
                SECTION_D: {
                    bass: [FIGURE_3, FIGURE_4, FIGURE_6],
                    lead: [FIGURE_4, FIGURE_5, FIGURE_6],
                }
            }
        };
    })();
    exports.SUITE_2 = SUITE_2;
    var SUITE_3 = (function () {
        var FIGURE_1 = [[100, 400], [0, 200], [50, 100], [0, 100], [100, 200], [50, 200], [100, 200], [0, 200], [100, 400], [0, 200], [50, 100], [0, 100], [100, 200], [50, 200], [100, 200], [0, 200], [80, 400], [0, 200], [40, 100], [0, 100], [80, 200], [40, 200], [80, 200], [0, 200], [80, 400], [0, 200], [40, 100], [0, 100], [80, 200], [40, 200], [80, 200], [0, 200]]
            .map(AudioUtils_2.transpose8va);
        var FIGURE_2 = [[200, 1400], [100, 200], [235, 800], [225, 800], [270, 1600], [300, 800], [270, 400], [235, 200], [225, 200]];
        var FIGURE_3 = [[75, 1600], [80, 1600], [100, 3200]]
            .map(AudioUtils_2.transpose8va);
        var FIGURE_4 = [[300, 200], [280, 400], [235, 100], [200, 100], [240, 400], [225, 200], [200, 100], [0, 100], [300, 200], [280, 400], [235, 100], [200, 100], [240, 400], [225, 200], [200, 100], [0, 100], [300, 200], [280, 400], [235, 100], [200, 100], [240, 400], [225, 200], [200, 100], [0, 100], [300, 200], [280, 400], [235, 100], [200, 100], [240, 400], [225, 200], [200, 100], [0, 100]];
        var FIGURE_5 = [[200, 800], [225, 400], [235, 400], [200, 200], [150, 200], [100, 400], [180, 800], [160, 600], [100, 200], [150, 200], [160, 200], [100, 400], [120, 200], [150, 200], [180, 400], [230, 800]]
            .map(AudioUtils_2.transpose8va);
        var FIGURE_6 = [[100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [150, 150], [0, 50], [160, 150], [0, 50], [180, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [160, 150], [0, 50], [150, 150], [0, 50], [120, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [150, 150], [0, 50], [160, 150], [0, 50], [180, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [100, 150], [0, 50], [235, 150], [0, 50], [225, 150], [0, 50], [180, 150], [0, 50]];
        return {
            length: 6400,
            sections: {
                SECTION_A: {
                    bass: [FIGURE_1, FIGURE_6]
                },
                SECTION_B: {
                    bass: [FIGURE_1, FIGURE_2, FIGURE_4],
                    lead: [FIGURE_4, FIGURE_5]
                },
                SECTION_C: {
                    bass: [FIGURE_2, FIGURE_3 /*, FIGURE_4*/],
                    lead: [FIGURE_4]
                },
                SECTION_D: {
                    bass: [FIGURE_3, FIGURE_4, FIGURE_6],
                    lead: [FIGURE_4, FIGURE_5, FIGURE_6],
                }
            }
        };
    })();
    exports.SUITE_3 = SUITE_3;
    var SUITE_4 = (function () {
        var FIGURE_1 = [[100, 1920], [135, 1920], [100, 1920], [150, 1920]]
            .map(AudioUtils_2.transpose8va);
        var FIGURE_2 = [[80, 1920], [100, 1920], [120, 1920], [90, 1920]]
            .map(AudioUtils_2.transpose8va);
        var FIGURE_3 = [[100, 960], [150, 960], [120, 960], [135, 960], [100, 960], [150, 960], [120, 960], [135, 960]]
            .map(AudioUtils_2.transpose8va);
        var FIGURE_4 = _duplicate([[0, 240], [50, 240], [150, 240], [50, 240], [120, 240], [50, 240], [0, 480], [120, 240], [150, 240], [50, 240], [180, 1200]])
            .map(AudioUtils_2.transpose8va);
        var FIGURE_5 = [[200, 720], [240, 480], [0, 480], [270, 480], [280, 240], [270, 240], [240, 240], [270, 240], [240, 240], [0, 480], [200, 720], [240, 720], [0, 480], [300, 240], [360, 240], [300, 240], [280, 480], [0, 720]];
        var FIGURE_6 = _duplicate([[100, 200], [0, 40], [100, 240], [0, 240], [100, 240], [0, 960], [100, 200], [0, 40], [100, 200], [0, 40], [120, 480], [100, 200], [0, 40], [100, 200], [0, 40], [90, 480]])
            .map(AudioUtils_2.transpose8va);
        return {
            length: 7680,
            sections: {
                SECTION_A: {
                    bass: [FIGURE_1, FIGURE_6]
                },
                SECTION_B: {
                    bass: [FIGURE_1, FIGURE_2, FIGURE_4],
                    lead: [FIGURE_4, FIGURE_5]
                },
                SECTION_C: {
                    bass: [FIGURE_2, FIGURE_3 /*, FIGURE_4*/],
                    lead: [FIGURE_4]
                },
                SECTION_D: {
                    bass: [FIGURE_3, FIGURE_4, FIGURE_6],
                    lead: [FIGURE_4, FIGURE_5, FIGURE_6],
                }
            }
        };
    })();
    exports.SUITE_4 = SUITE_4;
});
define("core/actions", ["require", "exports", "core/GameState", "units/Unit", "graphics/SpriteRenderer", "maps/MapFactory", "units/UnitClasses", "sounds/Music", "maps/TileSets", "core/InputHandler", "utils/RandomUtils", "types/types", "maps/MapUtils", "sounds/Suites"], function (require, exports, GameState_1, Unit_2, SpriteRenderer_1, MapFactory_1, UnitClasses_2, Music_2, TileSets_1, InputHandler_1, RandomUtils_11, types_18, MapUtils_9, Suites_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /*
     * This file defines functions that will be exported to the "global namespace" (window.jwb.*).
     */
    function loadMap(index) {
        var state = jwb.state;
        if (index >= state.maps.length) {
            Music_2.default.stop();
            jwb.state.screen = types_18.GameScreen.VICTORY;
        }
        else {
            state.mapIndex = index;
            // TODO - this isn't memoized
            var mapBuilder = state.maps[index]();
            state.setMap(mapBuilder.build());
        }
    }
    exports.loadMap = loadMap;
    function initialize() {
        // @ts-ignore
        window.jwb = window.jwb || {};
        jwb.renderer = new SpriteRenderer_1.default();
        InputHandler_1.attachEvents();
        _initState();
        return jwb.renderer.render();
    }
    exports.initialize = initialize;
    function _initState() {
        var playerUnit = new Unit_2.default(UnitClasses_2.default.PLAYER, 'player', 1, { x: 0, y: 0 });
        jwb.state = new GameState_1.default(playerUnit, [
            function () { return MapFactory_1.default.createRandomMap(types_18.MapLayout.ROOMS_AND_CORRIDORS, TileSets_1.default.DUNGEON, 1, 28, 22, 9, 4); },
            function () { return MapFactory_1.default.createRandomMap(types_18.MapLayout.ROOMS_AND_CORRIDORS, TileSets_1.default.DUNGEON, 2, 30, 23, 10, 4); },
            function () { return MapFactory_1.default.createRandomMap(types_18.MapLayout.ROOMS_AND_CORRIDORS, TileSets_1.default.DUNGEON, 3, 32, 24, 11, 3); },
            function () { return MapFactory_1.default.createRandomMap(types_18.MapLayout.BLOB, TileSets_1.default.CAVE, 4, 34, 25, 12, 3); },
            function () { return MapFactory_1.default.createRandomMap(types_18.MapLayout.BLOB, TileSets_1.default.CAVE, 5, 36, 26, 13, 3); },
            function () { return MapFactory_1.default.createRandomMap(types_18.MapLayout.BLOB, TileSets_1.default.CAVE, 6, 38, 27, 14, 3); }
        ]);
    }
    function startGame() {
        loadMap(0);
        Music_2.default.stop();
        Music_2.default.playSuite(RandomUtils_11.randChoice([Suites_1.SUITE_1, Suites_1.SUITE_2, Suites_1.SUITE_3]));
        return jwb.renderer.render();
    }
    exports.startGame = startGame;
    function restartGame() {
        _initState();
        return startGame();
    }
    exports.restartGame = restartGame;
    /**
     * Add any tiles the player can currently see to the map's revealed tiles list.
     */
    function revealTiles() {
        var playerUnit = jwb.state.playerUnit;
        var map = jwb.state.getMap();
        map.rooms.forEach(function (room) {
            if (MapUtils_9.contains(room, playerUnit)) {
                for (var y = room.top; y < room.top + room.height; y++) {
                    for (var x = room.left; x < room.left + room.width; x++) {
                        if (!MapUtils_9.isTileRevealed({ x: x, y: y })) {
                            map.revealedTiles.push({ x: x, y: y });
                        }
                    }
                }
            }
        });
        var radius = 2;
        for (var y = playerUnit.y - radius; y <= playerUnit.y + radius; y++) {
            for (var x = playerUnit.x - radius; x <= playerUnit.x + radius; x++) {
                if (!MapUtils_9.isTileRevealed({ x: x, y: y })) {
                    map.revealedTiles.push({ x: x, y: y });
                }
            }
        }
    }
    exports.revealTiles = revealTiles;
});
define("core/InputHandler", ["require", "exports", "core/TurnHandler", "sounds/Sounds", "items/ItemUtils", "utils/PromiseUtils", "units/UnitUtils", "sounds/SoundFX", "core/actions", "types/types"], function (require, exports, TurnHandler_1, Sounds_5, ItemUtils_1, PromiseUtils_9, UnitUtils_2, SoundFX_5, actions_2, types_19) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var KeyCommand;
    (function (KeyCommand) {
        KeyCommand["UP"] = "UP";
        KeyCommand["LEFT"] = "LEFT";
        KeyCommand["DOWN"] = "DOWN";
        KeyCommand["RIGHT"] = "RIGHT";
        KeyCommand["SHIFT_UP"] = "SHIFT_UP";
        KeyCommand["SHIFT_LEFT"] = "SHIFT_LEFT";
        KeyCommand["SHIFT_DOWN"] = "SHIFT_DOWN";
        KeyCommand["SHIFT_RIGHT"] = "SHIFT_RIGHT";
        KeyCommand["TAB"] = "TAB";
        KeyCommand["ENTER"] = "ENTER";
        KeyCommand["SPACEBAR"] = "SPACEBAR";
    })(KeyCommand || (KeyCommand = {}));
    function _mapToCommand(e) {
        switch (e.key) {
            case 'w':
            case 'W':
            case 'ArrowUp':
                return (e.shiftKey ? KeyCommand.SHIFT_UP : KeyCommand.UP);
            case 's':
            case 'S':
            case 'ArrowDown':
                return (e.shiftKey ? KeyCommand.SHIFT_DOWN : KeyCommand.DOWN);
            case 'a':
            case 'A':
            case 'ArrowLeft':
                return (e.shiftKey ? KeyCommand.SHIFT_LEFT : KeyCommand.LEFT);
            case 'd':
            case 'D':
            case 'ArrowRight':
                return (e.shiftKey ? KeyCommand.SHIFT_RIGHT : KeyCommand.RIGHT);
            case 'Tab':
                return KeyCommand.TAB;
            case 'Enter':
                return KeyCommand.ENTER;
            case ' ':
                return KeyCommand.SPACEBAR;
        }
        return null;
    }
    var BUSY = false;
    function keyHandlerWrapper(e) {
        if (!BUSY) {
            BUSY = true;
            keyHandler(e)
                .then(function () { BUSY = false; });
        }
    }
    function keyHandler(e) {
        var command = _mapToCommand(e);
        switch (command) {
            case KeyCommand.UP:
            case KeyCommand.LEFT:
            case KeyCommand.DOWN:
            case KeyCommand.RIGHT:
            case KeyCommand.SHIFT_UP:
            case KeyCommand.SHIFT_DOWN:
            case KeyCommand.SHIFT_LEFT:
            case KeyCommand.SHIFT_RIGHT:
                return _handleArrowKey(command);
            case KeyCommand.SPACEBAR:
                return TurnHandler_1.default.playTurn(null);
            case KeyCommand.ENTER:
                return _handleEnter();
            case KeyCommand.TAB:
                e.preventDefault();
                return _handleTab();
            default:
        }
        return PromiseUtils_9.resolvedPromise();
    }
    exports.simulateKeyPress = keyHandler;
    function _handleArrowKey(command) {
        var _a, _b, _c, _d;
        var state = jwb.state;
        switch (state.screen) {
            case types_19.GameScreen.GAME:
                var dx_1;
                var dy_1;
                switch (command) {
                    case KeyCommand.UP:
                    case KeyCommand.SHIFT_UP:
                        _a = [0, -1], dx_1 = _a[0], dy_1 = _a[1];
                        break;
                    case KeyCommand.DOWN:
                    case KeyCommand.SHIFT_DOWN:
                        _b = [0, 1], dx_1 = _b[0], dy_1 = _b[1];
                        break;
                    case KeyCommand.LEFT:
                    case KeyCommand.SHIFT_LEFT:
                        _c = [-1, 0], dx_1 = _c[0], dy_1 = _c[1];
                        break;
                    case KeyCommand.RIGHT:
                    case KeyCommand.SHIFT_RIGHT:
                        _d = [1, 0], dx_1 = _d[0], dy_1 = _d[1];
                        break;
                    default:
                        throw "Invalid direction command " + command;
                }
                var queuedOrder = (function () {
                    switch (command) {
                        case KeyCommand.SHIFT_UP:
                        case KeyCommand.SHIFT_DOWN:
                        case KeyCommand.SHIFT_LEFT:
                        case KeyCommand.SHIFT_RIGHT:
                            return function (u) { return UnitUtils_2.fireProjectile(u, { dx: dx_1, dy: dy_1 }); };
                        default:
                            return function (u) { return UnitUtils_2.moveOrAttack(u, { x: u.x + dx_1, y: u.y + dy_1 }); };
                    }
                })();
                return TurnHandler_1.default.playTurn(queuedOrder);
            case types_19.GameScreen.INVENTORY:
                var inventory = state.playerUnit.inventory;
                switch (command) {
                    case KeyCommand.UP:
                    case KeyCommand.SHIFT_UP:
                        inventory.previousItem();
                        break;
                    case KeyCommand.DOWN:
                    case KeyCommand.SHIFT_DOWN:
                        inventory.nextItem();
                        break;
                    case KeyCommand.LEFT:
                    case KeyCommand.SHIFT_LEFT:
                        inventory.previousCategory();
                        break;
                    case KeyCommand.RIGHT:
                    case KeyCommand.SHIFT_RIGHT:
                        inventory.nextCategory();
                        break;
                }
                return jwb.renderer.render();
            case types_19.GameScreen.TITLE:
            case types_19.GameScreen.VICTORY:
            case types_19.GameScreen.GAME_OVER:
                return PromiseUtils_9.resolvedPromise();
            default:
                throw "Invalid game screen " + state.screen;
        }
    }
    function _handleEnter() {
        var state = jwb.state;
        var playerUnit = state.playerUnit;
        switch (state.screen) {
            case types_19.GameScreen.GAME: {
                var mapIndex = state.mapIndex;
                var map = state.getMap();
                var x = playerUnit.x, y = playerUnit.y;
                if (!map || (mapIndex === null)) {
                    throw 'Map is not loaded!';
                }
                var item = map.getItem({ x: x, y: y });
                if (!!item) {
                    ItemUtils_1.pickupItem(playerUnit, item);
                    map.removeItem({ x: x, y: y });
                }
                else if (map.getTile({ x: x, y: y }).type === types_19.TileType.STAIRS_DOWN) {
                    SoundFX_5.playSound(Sounds_5.default.DESCEND_STAIRS);
                    actions_2.loadMap(mapIndex + 1);
                }
                return TurnHandler_1.default.playTurn(null);
            }
            case types_19.GameScreen.INVENTORY: {
                var playerUnit_1 = state.playerUnit;
                var selectedItem = playerUnit_1.inventory.selectedItem;
                if (!!selectedItem) {
                    state.screen = types_19.GameScreen.GAME;
                    return ItemUtils_1.useItem(playerUnit_1, selectedItem)
                        .then(function () { return jwb.renderer.render(); });
                }
                return PromiseUtils_9.resolvedPromise();
            }
            case types_19.GameScreen.TITLE:
                state.screen = types_19.GameScreen.GAME;
                return actions_2.startGame();
            case types_19.GameScreen.VICTORY:
            case types_19.GameScreen.GAME_OVER:
                state.screen = types_19.GameScreen.GAME;
                return actions_2.restartGame();
            default:
                throw "Unknown game screen: " + state.screen;
        }
    }
    function _handleTab() {
        var state = jwb.state, renderer = jwb.renderer;
        switch (state.screen) {
            case types_19.GameScreen.INVENTORY:
                state.screen = types_19.GameScreen.GAME;
                break;
            default:
                state.screen = types_19.GameScreen.INVENTORY;
                break;
        }
        return renderer.render();
    }
    function attachEvents() {
        window.onkeydown = keyHandlerWrapper;
    }
    exports.attachEvents = attachEvents;
});
/*
 * This file defines additional functions that will be exported to the "global namespace" (window.jwb.*)
 * that are only nitended for debugging purposes.
 */
define("core/debug", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function revealMap() {
        jwb.DEBUG = true;
        jwb.renderer.render();
    }
    exports.revealMap = revealMap;
    function killEnemies() {
        var map = jwb.state.getMap();
        map.units = map.units.filter(function (u) { return u === jwb.state.playerUnit; });
        jwb.renderer.render();
    }
    exports.killEnemies = killEnemies;
});
define("core/main", ["require", "exports", "core/actions", "core/debug"], function (require, exports, actions_3, debug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initialize = actions_3.initialize;
    exports.restartGame = actions_3.restartGame;
    exports.revealMap = debug_1.revealMap;
    exports.killEnemies = debug_1.killEnemies;
});
define("maps/generation/RoomCorridorDungeonGenerator2", ["require", "exports", "maps/generation/DungeonGenerator", "utils/RandomUtils"], function (require, exports, DungeonGenerator_3, RandomUtils_12) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RoomCorridorDungeonGenerator2 = /** @class */ (function (_super) {
        __extends(RoomCorridorDungeonGenerator2, _super);
        /**
         * @param minRoomDimension outer width, including wall
         * @param maxRoomDimension outer width, including wall
         * @param minRoomPadding minimum padding between each room and its containing section
         */
        function RoomCorridorDungeonGenerator2(tileSet, minRoomDimension, maxRoomDimension, minRoomPadding) {
            var _this = _super.call(this, tileSet) || this;
            _this._minRoomDimension = minRoomDimension;
            _this._maxRoomDimension = maxRoomDimension;
            _this._minRoomPadding = minRoomPadding;
            return _this;
        }
        RoomCorridorDungeonGenerator2.prototype.generateTiles = function (width, height) {
            // 1. Recursively subdivide the map into sections.
            //    Each section must fall within the max dimensions.
            // 2. Add rooms within sections, with appropriate padding.
            //    (Don't add a room for every section; approximately half.  Rules TBD.)
            var sections = this._generateSections(0, 0, width, height);
            this._removeRooms(sections);
            // 3. Construct a minimal spanning tree between sections (including those without rooms).
            var minimalSpanningTree = this._generateMinimalSpanningTree(sections);
            // 4.  Add all optional connections between sections.
            var optionalConnections = this._generateOptionalConnections(sections, minimalSpanningTree);
            // 5. Add "red-red" connections in empty rooms.
            // 6. Add "red-green" connections in empty rooms only if:
            //    - both edges connect to a room
            //    - there is no red-red connection in the section
            var internalConnections = this._addInternalConnections(sections, minimalSpanningTree, optionalConnections);
            // Compute the actual tiles based on section/connection specifications.
            var tiles = this._renderRoomsAndConnections(sections, __spreadArrays(minimalSpanningTree, [optionalConnections]), internalConnections);
            // 7. Add walls.
            this._addWalls(tiles);
            return {
                tiles: tiles,
                rooms: [],
                width: width,
                height: height
            };
        };
        /**
         * Generate a rectangular area of tiles with the specified dimensions, consisting of any number of rooms connected
         * by corridors.  To do so, split the area into two sub-areas and call this method recursively.  If this area is
         * not large enough to form two sub-regions, just return a single section.
         */
        RoomCorridorDungeonGenerator2.prototype._generateSections = function (left, top, width, height) {
            var splitDirection = this._getSplitDirection(width, height);
            if (splitDirection === 'HORIZONTAL') {
                var splitX = this._getSplitPoint(width);
                var leftWidth = splitX;
                var leftSections = this._generateSections(0, 0, leftWidth, height);
                var rightWidth = width - splitX;
                var rightSections = this._generateSections(splitX, 0, rightWidth, height);
                return __spreadArrays(leftSections, rightSections);
            }
            else if (splitDirection === 'VERTICAL') {
                var splitY = this._getSplitPoint(height);
                var topHeight = splitY;
                var bottomHeight = height - splitY;
                var topSections = this._generateSections(0, 0, width, topHeight);
                var bottomSections = this._generateSections(0, splitY, width, bottomHeight);
                return __spreadArrays(topSections, bottomSections);
            }
            else {
                var rect = {
                    left: left,
                    top: top,
                    width: width,
                    height: height
                };
                var padding = 1;
                var topPadding = 2;
                var roomRect = {
                    left: left + padding,
                    top: top + topPadding,
                    width: width - (2 * padding),
                    height: height - padding - topPadding
                };
                return [{ rect: rect, roomRect: roomRect }];
            }
        };
        RoomCorridorDungeonGenerator2.prototype._getSplitDirection = function (width, height) {
            // First, make sure the area is large enough to support two sections; if not, we're done
            var minSectionDimension = this._minRoomDimension + (2 * this._minRoomPadding);
            var canSplitHorizontally = (width >= (2 * minSectionDimension));
            var canSplitVertically = (height >= (2 * minSectionDimension));
            if (canSplitHorizontally) {
                return 'HORIZONTAL';
            }
            else if (canSplitVertically) {
                return 'VERTICAL';
            }
            else {
                return null;
            }
        };
        /**
         * @param dimension width or height
         * @returns the min X/Y coordinate of the *second* room
         */
        RoomCorridorDungeonGenerator2.prototype._getSplitPoint = function (dimension) {
            var minSectionDimension = this._minRoomDimension + 2 * this._minRoomPadding;
            var minSplitPoint = minSectionDimension;
            var maxSplitPoint = dimension - minSectionDimension;
            return RandomUtils_12.randInt(minSplitPoint, maxSplitPoint);
        };
        RoomCorridorDungeonGenerator2.prototype._removeRooms = function (sections) {
            var minRooms = 3;
            var maxRooms = Math.max(sections.length - 1, minRooms);
            if (sections.length < minRooms) {
                throw 'Not enough sections';
            }
            var numRooms = RandomUtils_12.randInt(minRooms, maxRooms);
            var shuffledSections = __spreadArrays(sections);
            RandomUtils_12.shuffle(shuffledSections);
            for (var i = numRooms; i < shuffledSections.length; i++) {
                shuffledSections[i].roomRect = null;
            }
        };
        RoomCorridorDungeonGenerator2.prototype._generateMinimalSpanningTree = function (sections) {
            var _this = this;
            var connectedSection = RandomUtils_12.randChoice(sections);
            var connectedSections = [connectedSection];
            var unconnectedSections = __spreadArrays(sections).filter(function (section) { return section !== connectedSection; });
            RandomUtils_12.shuffle(unconnectedSections);
            var connections = [];
            unconnectedSections.forEach(function (section) {
                RandomUtils_12.shuffle(connectedSections);
                connectedSections.forEach(function (connectedSection) {
                    if (_this._canConnect(connectedSection, section)) {
                        unconnectedSections.splice(unconnectedSections.indexOf(section), 1);
                        connectedSections.push(section);
                    }
                });
            });
            return connections;
        };
        RoomCorridorDungeonGenerator2.prototype._generateOptionalConnections = function (sections, minimalSpanningTree) {
            throw 'TODO';
        };
        RoomCorridorDungeonGenerator2.prototype._addRedRedConnections = function (sections, minimalSpanningTree) {
            throw 'TODO';
        };
        RoomCorridorDungeonGenerator2.prototype._addInternalConnections = function (sections, minimalSpanningTree, optionalConnections) {
            throw 'TODO';
        };
        RoomCorridorDungeonGenerator2.prototype._renderRoomsAndConnections = function (sections, param2, internalConnections) {
            throw 'TODO';
        };
        RoomCorridorDungeonGenerator2.prototype._addWalls = function (tiles) {
            throw 'TODO';
        };
        RoomCorridorDungeonGenerator2.prototype._canConnect = function (connectedSection, section) {
            throw 'TODO';
        };
        return RoomCorridorDungeonGenerator2;
    }(DungeonGenerator_3.default));
    exports.default = RoomCorridorDungeonGenerator2;
});
//# sourceMappingURL=roguelike.js.map