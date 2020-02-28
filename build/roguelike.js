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
define("utils/ImageUtils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function loadImage(filename) {
        return new Promise(function (resolve, reject) {
            var canvas = document.createElement('canvas');
            canvas.style.display = 'none';
            /**
             * @type {HTMLImageElement}
             */
            var img = document.createElement('img');
            img.addEventListener('load', function () {
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
            document.body.appendChild(canvas);
            document.body.appendChild(img);
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
});
define("classes/ImageLoader", ["require", "exports", "utils/ImageUtils", "utils/PromiseUtils"], function (require, exports, ImageUtils_1, PromiseUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ImageLoader = /** @class */ (function () {
        function ImageLoader(filename, transparentColor, paletteSwaps, effects) {
            if (paletteSwaps === void 0) { paletteSwaps = {}; }
            if (effects === void 0) { effects = []; }
            this.image = null;
            this.image = null;
            this._imageSupplier = function () { return ImageUtils_1.loadImage(filename)
                .then(function (imageData) { return ImageUtils_1.applyTransparentColor(imageData, transparentColor); })
                .then(function (imageData) { return ImageUtils_1.replaceColors(imageData, paletteSwaps); })
                // @ts-ignore
                .then(function (imageData) { return PromiseUtils_1.chainPromises(effects, imageData); })
                .then(function (imageData) { return createImageBitmap(imageData); }); };
        }
        ImageLoader.prototype.load = function () {
            if (!this.image) {
                this.image = this._imageSupplier();
            }
            return this.image;
        };
        return ImageLoader;
    }());
    exports.default = ImageLoader;
});
define("classes/Sprite", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Sprite = /** @class */ (function () {
        function Sprite(imageMap, key, _a) {
            var dx = _a.dx, dy = _a.dy;
            this._imageMap = imageMap;
            this.defaultKey = key;
            this.key = key;
            this.dx = dx;
            this.dy = dy;
            this.getImage();
        }
        Sprite.prototype.getImage = function () {
            var imageLoader = this._imageMap[this.key];
            if (!imageLoader) {
                throw "Invalid sprite key " + this.key;
            }
            return imageLoader.load();
        };
        Sprite.prototype.setImage = function (key) {
            this.key = key;
            return this.getImage();
        };
        return Sprite;
    }());
    exports.default = Sprite;
});
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
define("types", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ItemCategory;
    (function (ItemCategory) {
        ItemCategory["POTION"] = "POTION";
        ItemCategory["SCROLL"] = "SCROLL";
        ItemCategory["WEAPON"] = "WEAPON";
    })(ItemCategory || (ItemCategory = {}));
    exports.ItemCategory = ItemCategory;
    var EquipmentCategory;
    (function (EquipmentCategory) {
        EquipmentCategory["WEAPON"] = "WEAPON";
        EquipmentCategory["ARMOR"] = "ARMOR";
    })(EquipmentCategory || (EquipmentCategory = {}));
    exports.EquipmentCategory = EquipmentCategory;
    var GameScreen;
    (function (GameScreen) {
        GameScreen["GAME"] = "GAME";
        GameScreen["INVENTORY"] = "INVENTORY";
    })(GameScreen || (GameScreen = {}));
    exports.GameScreen = GameScreen;
});
define("classes/PlayerSprite", ["require", "exports", "classes/ImageLoader", "utils/ImageUtils", "classes/Sprite", "types/Colors"], function (require, exports, ImageLoader_1, ImageUtils_2, Sprite_1, Colors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SpriteKeys;
    (function (SpriteKeys) {
        SpriteKeys["STANDING"] = "STANDING";
        SpriteKeys["STANDING_DAMAGED"] = "STANDING_DAMAGED";
    })(SpriteKeys || (SpriteKeys = {}));
    var PlayerSprite = /** @class */ (function (_super) {
        __extends(PlayerSprite, _super);
        function PlayerSprite(paletteSwaps) {
            var _a;
            return _super.call(this, (_a = {},
                _a[SpriteKeys.STANDING] = new ImageLoader_1.default('player_standing_SE_1', Colors_1.default.WHITE, paletteSwaps),
                _a[SpriteKeys.STANDING_DAMAGED] = new ImageLoader_1.default('player_standing_SE_1', Colors_1.default.WHITE, paletteSwaps, [function (img) { return ImageUtils_2.replaceAll(img, Colors_1.default.WHITE); }]),
                _a), SpriteKeys.STANDING, { dx: -4, dy: -20 }) || this;
        }
        PlayerSprite.SpriteKeys = SpriteKeys;
        return PlayerSprite;
    }(Sprite_1.default));
    exports.default = PlayerSprite;
});
define("SpriteFactory", ["require", "exports", "classes/ImageLoader", "classes/Sprite", "classes/PlayerSprite", "types/Colors"], function (require, exports, ImageLoader_2, Sprite_2, PlayerSprite_1, Colors_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DEFAULT_SPRITE_KEY = 'default';
    function _staticSprite(imageLoader, _a) {
        var _b;
        var dx = _a.dx, dy = _a.dy;
        return new Sprite_2.default((_b = {}, _b[DEFAULT_SPRITE_KEY] = imageLoader, _b), DEFAULT_SPRITE_KEY, { dx: dx, dy: dy });
    }
    var SpriteFactory = {
        PLAYER: function (paletteSwaps) { return new PlayerSprite_1.default(paletteSwaps); },
        WALL_TOP: function (paletteSwaps) { return _staticSprite(new ImageLoader_2.default('tile_wall', Colors_2.default.WHITE, paletteSwaps), { dx: 0, dy: 0 }); },
        WALL_HALL: function (paletteSwaps) { return _staticSprite(new ImageLoader_2.default('tile_wall_hall', Colors_2.default.WHITE, paletteSwaps), { dx: 0, dy: 0 }); },
        FLOOR: function (paletteSwaps) { return _staticSprite(new ImageLoader_2.default('tile_floor', Colors_2.default.WHITE, paletteSwaps), { dx: 0, dy: 0 }); },
        FLOOR_HALL: function (paletteSwaps) { return _staticSprite(new ImageLoader_2.default('tile_floor_hall', Colors_2.default.WHITE, paletteSwaps), { dx: 0, dy: 0 }); },
        MAP_SWORD: function (paletteSwaps) { return _staticSprite(new ImageLoader_2.default('sword_icon_small', Colors_2.default.WHITE, paletteSwaps), { dx: 0, dy: -8 }); },
        MAP_POTION: function (paletteSwaps) { return _staticSprite(new ImageLoader_2.default('potion_small', Colors_2.default.WHITE, paletteSwaps), { dx: 0, dy: -8 }); },
        MAP_SCROLL: function (paletteSwaps) { return _staticSprite(new ImageLoader_2.default('scroll_icon', Colors_2.default.WHITE, paletteSwaps), { dx: 0, dy: 0 }); },
        STAIRS_DOWN: function (paletteSwaps) { return _staticSprite(new ImageLoader_2.default('stairs_down2', Colors_2.default.WHITE, paletteSwaps), { dx: 0, dy: 0 }); }
    };
    exports.default = SpriteFactory;
});
define("EquipmentClasses", ["require", "exports", "types", "SpriteFactory", "types/Colors"], function (require, exports, types_1, SpriteFactory_1, Colors_3) {
    "use strict";
    var _a, _b, _c, _d;
    Object.defineProperty(exports, "__esModule", { value: true });
    var BRONZE_SWORD = {
        name: 'Bronze Sword',
        char: 'S',
        itemCategory: types_1.ItemCategory.WEAPON,
        equipmentCategory: types_1.EquipmentCategory.WEAPON,
        mapIcon: SpriteFactory_1.default.MAP_SWORD,
        paletteSwaps: (_a = {},
            _a[Colors_3.default.BLACK] = Colors_3.default.BLACK,
            _a[Colors_3.default.DARK_GRAY] = Colors_3.default.LIGHT_BROWN,
            _a[Colors_3.default.LIGHT_GRAY] = Colors_3.default.LIGHT_BROWN,
            _a),
        damage: 6,
        minLevel: 1,
        maxLevel: 3
    };
    var IRON_SWORD = {
        name: 'Iron Sword',
        char: 'S',
        itemCategory: types_1.ItemCategory.WEAPON,
        equipmentCategory: types_1.EquipmentCategory.WEAPON,
        mapIcon: SpriteFactory_1.default.MAP_SWORD,
        paletteSwaps: (_b = {},
            _b[Colors_3.default.DARK_GRAY] = Colors_3.default.BLACK,
            _b[Colors_3.default.LIGHT_GRAY] = Colors_3.default.DARK_GRAY,
            _b),
        damage: 9,
        minLevel: 2,
        maxLevel: 4
    };
    var STEEL_SWORD = {
        name: 'Steel Sword',
        char: 'S',
        itemCategory: types_1.ItemCategory.WEAPON,
        equipmentCategory: types_1.EquipmentCategory.WEAPON,
        mapIcon: SpriteFactory_1.default.MAP_SWORD,
        paletteSwaps: (_c = {},
            _c[Colors_3.default.DARK_GRAY] = Colors_3.default.DARK_GRAY,
            _c[Colors_3.default.LIGHT_GRAY] = Colors_3.default.LIGHT_GRAY,
            _c),
        damage: 12,
        minLevel: 4,
        maxLevel: 6
    };
    var FIRE_SWORD = {
        name: 'Fire Sword',
        char: 'S',
        itemCategory: types_1.ItemCategory.WEAPON,
        equipmentCategory: types_1.EquipmentCategory.WEAPON,
        mapIcon: SpriteFactory_1.default.MAP_SWORD,
        paletteSwaps: (_d = {},
            _d[Colors_3.default.DARK_GRAY] = Colors_3.default.YELLOW,
            _d[Colors_3.default.LIGHT_GRAY] = Colors_3.default.RED,
            _d[Colors_3.default.BLACK] = Colors_3.default.DARK_RED,
            _d),
        damage: 16,
        minLevel: 5,
        maxLevel: 6
    };
    function getWeaponClasses() {
        return [BRONZE_SWORD, IRON_SWORD, STEEL_SWORD, FIRE_SWORD];
    }
    exports.default = {
        BRONZE_SWORD: BRONZE_SWORD,
        IRON_SWORD: IRON_SWORD,
        STEEL_SWORD: STEEL_SWORD,
        getWeaponClasses: getWeaponClasses
    };
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
            // And swap it with the current element.
            var tmp = list[i];
            list[n] = list[i];
            list[i] = tmp;
            n--;
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
        throw 'fux';
    }
    exports.weightedRandom = weightedRandom;
});
define("utils/MapUtils", ["require", "exports", "utils/RandomUtils"], function (require, exports, RandomUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function pickUnoccupiedLocations(tiles, allowedTileTypes, occupiedLocations, numToChoose) {
        var unoccupiedLocations = [];
        var _loop_1 = function (y) {
            var _loop_2 = function (x) {
                if (allowedTileTypes.indexOf(tiles[y][x]) !== -1) {
                    if (occupiedLocations.filter(function (loc) { return (loc.x === x && loc.y === y); }).length === 0) {
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
                var index = RandomUtils_1.randInt(0, unoccupiedLocations.length - 1);
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
});
define("classes/Pathfinder", ["require", "exports", "utils/MapUtils", "utils/RandomUtils"], function (require, exports, MapUtils_1, RandomUtils_2) {
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
        return MapUtils_1.civDistance(coordinates, goal);
        // return manhattanDistance(coordinates, goal);
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
        function Pathfinder(blockedTileDetector, tileCostCalculator) {
            this.blockedTileDetector = blockedTileDetector;
            this.tileCostCalculator = tileCostCalculator;
        }
        /**
         * http://theory.stanford.edu/~amitp/GameProgramming/ImplementationNotes.html#sketch
         */
        Pathfinder.prototype.findPath = function (start, goal, rect) {
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
                    // Done!
                    var path = traverseParents(bestNode);
                    return { value: path };
                }
                else {
                    var bestNodes = nodeCosts.filter(function (_a) {
                        var node = _a.node, cost = _a.cost;
                        return cost === nodeCosts[0].cost;
                    });
                    var _a = RandomUtils_2.randChoice(bestNodes), chosenNode_1 = _a.node, chosenNodeCost_1 = _a.cost;
                    open.splice(open.indexOf(chosenNode_1), 1);
                    closed.push(chosenNode_1);
                    this_1._findNeighbors(chosenNode_1, rect).forEach(function (neighbor) {
                        if (closed.some(function (coordinates) { return MapUtils_1.coordinatesEquals(coordinates, neighbor); })) {
                            // already been seen, don't need to look at it*
                        }
                        else if (open.some(function (coordinates) { return MapUtils_1.coordinatesEquals(coordinates, neighbor); })) {
                            // don't need to look at it now, will look later?
                        }
                        else {
                            var movementCost = _this.tileCostCalculator(chosenNode_1, neighbor);
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
        Pathfinder.prototype._findNeighbors = function (tile, rect) {
            var _this = this;
            return CARDINAL_DIRECTIONS
                .map(function (_a) {
                var dx = _a[0], dy = _a[1];
                return ({ x: tile.x + dx, y: tile.y + dy });
            })
                .filter(function (_a) {
                var x = _a.x, y = _a.y;
                return MapUtils_1.contains(rect, { x: x, y: y });
            })
                .filter(function (_a) {
                var x = _a.x, y = _a.y;
                return !_this.blockedTileDetector({ x: x, y: y });
            });
        };
        return Pathfinder;
    }());
    exports.default = Pathfinder;
});
define("classes/SoundPlayer", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SoundPlayer = /** @class */ (function () {
        function SoundPlayer(maxPolyphony, gain) {
            this._context = new AudioContext();
            this._gainNode = this._context.createGain();
            this._gainNode.gain.value = gain * 0.1; // sounds can be VERY loud
            this._gainNode.connect(this._context.destination);
            this._oscillators = [];
        }
        SoundPlayer.prototype._newOscillator = function () {
            var oscillatorNode = this._context.createOscillator();
            oscillatorNode.type = 'square';
            oscillatorNode.connect(this._gainNode);
            return {
                node: oscillatorNode,
                started: false,
                stopped: false,
                isRepeating: false
            };
        };
        ;
        SoundPlayer.prototype.stop = function () {
            try {
                this._oscillators.forEach(function (oscillator) {
                    if (oscillator && oscillator.started) {
                        oscillator.node.stop(0);
                        oscillator.stopped = true;
                    }
                });
                this._oscillators = [];
            }
            catch (e) {
                console.error(e);
            }
        };
        ;
        SoundPlayer.prototype.playSound = function (samples, repeating) {
            var _this = this;
            if (repeating === void 0) { repeating = false; }
            var oscillator = this._newOscillator();
            this._oscillators.push(oscillator);
            if (samples.length) {
                var startTime = this._context.currentTime;
                var nextStartTime = startTime;
                for (var i = 0; i < samples.length; i++) {
                    var _a = samples[i], freq = _a[0], ms = _a[1];
                    oscillator.node.frequency.setValueAtTime(freq, nextStartTime);
                    nextStartTime += ms / 1000;
                }
                var runtime = samples.map(function (_a) {
                    var freq = _a[0], ms = _a[1];
                    return ms;
                }).reduce(function (a, b) { return a + b; });
                oscillator.node.start();
                oscillator.started = true;
                if (repeating) {
                    oscillator.isRepeating = true;
                }
                oscillator.node.onended = function () {
                    if (oscillator.isRepeating && !oscillator.stopped) {
                        _this.playSound(samples, true);
                    }
                    else {
                        _this._oscillators.splice(_this._oscillators.indexOf(oscillator, 1));
                    }
                };
                oscillator.node.stop(startTime + runtime / 1000);
            }
        };
        ;
        return SoundPlayer;
    }());
    exports.default = SoundPlayer;
});
define("utils/AudioUtils", ["require", "exports", "classes/SoundPlayer"], function (require, exports, SoundPlayer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _getMusicPlayer = function () { return new SoundPlayer_1.default(4, 0.08); };
    var _getSoundPlayer = function () { return new SoundPlayer_1.default(4, 0.16); };
    // TODO very hacky memoizing
    var MUSIC = null;
    var SFX = null;
    function playSound(samples) {
        if (!SFX) {
            SFX = _getSoundPlayer();
        }
        SFX.playSound(samples, false);
    }
    exports.playSound = playSound;
    function playMusic(samples) {
        if (!MUSIC) {
            MUSIC = _getMusicPlayer();
        }
        MUSIC.playSound(samples, false);
    }
    exports.playMusic = playMusic;
});
define("Sounds", ["require", "exports"], function (require, exports) {
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
define("utils/UnitUtils", ["require", "exports", "utils/AudioUtils", "Sounds"], function (require, exports, AudioUtils_1, Sounds_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function moveOrAttack(unit, _a) {
        var x = _a.x, y = _a.y;
        var _b = jwb.state, messages = _b.messages, playerUnit = _b.playerUnit;
        var map = jwb.state.getMap();
        return new Promise(function (resolve) {
            var _a;
            if (map.contains({ x: x, y: y }) && !map.isBlocked({ x: x, y: y })) {
                _a = [x, y], unit.x = _a[0], unit.y = _a[1];
                if (unit === playerUnit) {
                    AudioUtils_1.playSound(Sounds_1.default.FOOTSTEP);
                }
                resolve();
            }
            else {
                var targetUnit = map.getUnit({ x: x, y: y });
                if (!!targetUnit) {
                    var damage = unit.getDamage();
                    messages.push(unit.name + " (" + unit.level + ") hit " + targetUnit.name + " (" + targetUnit.level + ") for " + damage + " damage!");
                    targetUnit.takeDamage(damage, unit)
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
        return new Promise(function (resolve) {
            var map = jwb.state.getMap();
            var x = unit.x, y = unit.y;
            do {
                x += dx;
                y += dy;
            } while (!map.isBlocked({ x: x, y: y }));
            var targetUnit = map.getUnit({ x: x, y: y });
            if (!!targetUnit) {
                var messages = jwb.state.messages;
                var damage = unit.getDamage();
                messages.push(unit.name + " (" + unit.level + ") hit " + targetUnit.name + " (" + targetUnit.level + ") for " + damage + " damage!");
                targetUnit.takeDamage(damage, unit)
                    .then(function () { return resolve(); });
            }
            else {
                resolve();
            }
        });
    }
    exports.fireProjectile = fireProjectile;
});
define("UnitBehaviors", ["require", "exports", "utils/MapUtils", "classes/Pathfinder", "utils/RandomUtils", "utils/UnitUtils"], function (require, exports, MapUtils_2, Pathfinder_1, RandomUtils_3, UnitUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CARDINAL_DIRECTIONS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    function wanderAndAttack(unit) {
        var playerUnit = jwb.state.playerUnit;
        var map = jwb.state.getMap();
        var tiles = [];
        CARDINAL_DIRECTIONS.forEach(function (_a) {
            var dx = _a[0], dy = _a[1];
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
        return new Promise(function (resolve) { resolve(); });
    }
    function wander(unit) {
        var map = jwb.state.getMap();
        var tiles = [];
        CARDINAL_DIRECTIONS.forEach(function (_a) {
            var dx = _a[0], dy = _a[1];
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
        return new Promise(function (resolve) { resolve(); });
    }
    function _attackPlayerUnit_withPath(unit) {
        var playerUnit = jwb.state.playerUnit;
        var map = jwb.state.getMap();
        var mapRect = map.getRect();
        var blockedTileDetector = function (_a) {
            var x = _a.x, y = _a.y;
            if (!map.getTile({ x: x, y: y }).isBlocking) {
                return false;
            }
            else if (MapUtils_2.coordinatesEquals({ x: x, y: y }, playerUnit)) {
                return false;
            }
            return true;
        };
        var path = new Pathfinder_1.default(blockedTileDetector, function () { return 1; }).findPath(unit, playerUnit, mapRect);
        if (path.length > 1) {
            var _a = path[1], x = _a.x, y = _a.y; // first tile is the unit's own tile
            var unitAtPoint = map.getUnit({ x: x, y: y });
            if (!unitAtPoint || unitAtPoint === playerUnit) {
                return UnitUtils_1.moveOrAttack(unit, { x: x, y: y });
            }
        }
        return new Promise(function (resolve) { resolve(); });
    }
    function fleeFromPlayerUnit(unit) {
        var playerUnit = jwb.state.playerUnit;
        var map = jwb.state.getMap();
        var tiles = [];
        CARDINAL_DIRECTIONS.forEach(function (_a) {
            var dx = _a[0], dy = _a[1];
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
            var _a = _sortBy(tiles, function (coordinates) { return MapUtils_2.manhattanDistance(coordinates, playerUnit); })[tiles.length - 1], x = _a.x, y = _a.y;
            return UnitUtils_1.moveOrAttack(unit, { x: x, y: y });
        }
        return new Promise(function (resolve) { resolve(); });
    }
    function _sortBy(list, mapFunction) {
        return list.sort(function (a, b) { return mapFunction(a) - mapFunction(b); });
    }
    var UnitBehaviors = {
        WANDER: wander,
        ATTACK_PLAYER: _attackPlayerUnit_withPath,
        FLEE_FROM_PLAYER: fleeFromPlayerUnit,
        STAY: function () { return new Promise(function (resolve) { resolve(); }); }
    };
    exports.default = UnitBehaviors;
});
define("UnitAI", ["require", "exports", "utils/MapUtils", "utils/RandomUtils", "UnitBehaviors"], function (require, exports, MapUtils_3, RandomUtils_4, UnitBehaviors_1) {
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
    var FULL_AGGRO = function (unit) { return UnitBehaviors_1.default.ATTACK_PLAYER(unit); };
    exports.FULL_AGGRO = FULL_AGGRO;
});
define("classes/UnitClass", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("utils/SpriteUtils", ["require", "exports", "utils/PromiseUtils"], function (require, exports, PromiseUtils_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function playAnimation(sprite, keys, delay) {
        var renderer = jwb.renderer;
        var promises = [];
        keys.forEach(function (key) {
            promises.push(function () { return new Promise(function (resolve) {
                sprite.setImage(key)
                    .then(function () { return renderer.render(); })
                    .then(function () {
                    setTimeout(function () { resolve(); }, delay);
                });
            }); });
        });
        return PromiseUtils_2.chainPromises(promises)
            .then(function () { return sprite.setImage(sprite.defaultKey); })
            .then(function () { return renderer.render(); });
    }
    exports.playAnimation = playAnimation;
});
define("classes/InventoryItem", ["require", "exports"], function (require, exports) {
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
define("classes/InventoryMap", ["require", "exports", "types"], function (require, exports, types_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var categories = Object.values(types_2.ItemCategory);
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
                // TODO
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
            this.selectedCategory = categories[(index - 1) % categories.length];
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
                this.selectedItem = items[(index - 1) % items.length];
            }
        };
        return InventoryMap;
    }());
    exports.default = InventoryMap;
});
define("classes/EquippedItem", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var EquippedItem = /** @class */ (function () {
        function EquippedItem(name, category, inventoryItem, damage) {
            this.name = name;
            this.category = category;
            this.inventoryItem = inventoryItem;
            this.damage = damage;
        }
        return EquippedItem;
    }());
    exports.default = EquippedItem;
});
define("classes/EquipmentMap", ["require", "exports", "types"], function (require, exports, types_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var categories = Object.values(types_3.EquipmentCategory);
    var EquipmentMap = /** @class */ (function () {
        function EquipmentMap() {
            // @ts-ignore
            this._map = {};
            for (var _i = 0, categories_2 = categories; _i < categories_2.length; _i++) {
                var category = categories_2[_i];
                // TODO
                this._map[category] = [];
            }
        }
        EquipmentMap.prototype.add = function (item) {
            this._map[item.category].push(item);
        };
        EquipmentMap.prototype.remove = function (item) {
            var items = this._map[item.category];
            var index = items.indexOf(item);
            items.splice(index, 1);
        };
        EquipmentMap.prototype.get = function (category) {
            return __spreadArrays(this._map[category]);
        };
        EquipmentMap.prototype.getEntries = function () {
            return __spreadArrays(Object.entries(this._map));
        };
        return EquipmentMap;
    }());
    exports.default = EquipmentMap;
});
define("classes/Unit", ["require", "exports", "utils/AudioUtils", "Sounds", "utils/PromiseUtils", "classes/PlayerSprite", "utils/SpriteUtils", "classes/InventoryMap", "classes/EquipmentMap"], function (require, exports, AudioUtils_2, Sounds_2, PromiseUtils_3, PlayerSprite_2, SpriteUtils_1, InventoryMap_1, EquipmentMap_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LIFE_PER_TURN_MULTIPLIER = 0.005;
    var Unit = /** @class */ (function () {
        function Unit(unitClass, name, level, _a) {
            var x = _a.x, y = _a.y;
            this.char = '@';
            this.unitClass = unitClass;
            this.sprite = unitClass.sprite(unitClass.paletteSwaps);
            this.inventory = new InventoryMap_1.default();
            this.equipment = new EquipmentMap_1.default();
            this.x = x;
            this.y = y;
            this.name = name;
            this.level = level;
            this.experience = 0;
            this.maxLife = unitClass.startingLife;
            this.life = unitClass.startingLife;
            this.lifeRemainder = 0;
            this._damage = unitClass.startingDamage;
            this.queuedOrder = null;
            this.aiHandler = unitClass.aiHandler;
        }
        Unit.prototype._regenLife = function () {
            var lifePerTurn = (this.maxLife) * LIFE_PER_TURN_MULTIPLIER;
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
                return PromiseUtils_3.resolvedPromise();
            });
        };
        Unit.prototype.getDamage = function () {
            var damage = this._damage;
            this.equipment.getEntries().forEach(function (_a) {
                var category = _a[0], items = _a[1];
                items.forEach(function (item) {
                    damage += (item.damage || 0);
                });
            });
            return damage;
        };
        Unit.prototype._levelUp = function () {
            this.level++;
            var lifePerLevel = this.unitClass.lifePerLevel(this.level);
            this.maxLife += lifePerLevel;
            this.life += lifePerLevel;
            this._damage += this.unitClass.damagePerLevel(this.level);
            AudioUtils_2.playSound(Sounds_2.default.LEVEL_UP);
        };
        Unit.prototype.gainExperience = function (experience) {
            this.experience += experience;
            var experienceToNextLevel = this.experienceToNextLevel();
            while (!!experienceToNextLevel && this.experience >= experienceToNextLevel) {
                this.experience -= experienceToNextLevel;
                this._levelUp();
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
            var promises = [];
            if (this.sprite instanceof PlayerSprite_2.default) {
                var PlayerSpriteKeys = PlayerSprite_2.default.SpriteKeys;
                var sequence_1 = [PlayerSpriteKeys.STANDING_DAMAGED];
                promises.push(function () { return SpriteUtils_1.playAnimation(_this.sprite, sequence_1, 150); });
            }
            promises.push(function () { return new Promise(function (resolve) {
                _this.life = Math.max(_this.life - damage, 0);
                if (_this.life === 0) {
                    map.units = map.units.filter(function (u) { return u !== _this; });
                    if (_this === playerUnit) {
                        alert('Game Over!');
                        AudioUtils_2.playSound(Sounds_2.default.PLAYER_DIES);
                    }
                    else {
                        AudioUtils_2.playSound(Sounds_2.default.ENEMY_DIES);
                    }
                    if (sourceUnit) {
                        sourceUnit.gainExperience(1);
                    }
                }
                else {
                    if (_this === playerUnit) {
                        AudioUtils_2.playSound(Sounds_2.default.PLAYER_HITS_ENEMY);
                    }
                    else {
                        AudioUtils_2.playSound(Sounds_2.default.ENEMY_HITS_PLAYER);
                    }
                }
                resolve();
            }); });
            return PromiseUtils_3.chainPromises(promises);
        };
        ;
        return Unit;
    }());
    exports.default = Unit;
});
define("classes/MapItem", ["require", "exports"], function (require, exports) {
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
define("types/Tiles", ["require", "exports", "SpriteFactory"], function (require, exports, SpriteFactory_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Tiles = {
        FLOOR: {
            name: 'FLOOR',
            char: '.',
            sprite: SpriteFactory_2.default.FLOOR(),
            isBlocking: false
        },
        FLOOR_HALL: {
            name: 'FLOOR_HALL',
            char: '.',
            sprite: SpriteFactory_2.default.FLOOR_HALL(),
            isBlocking: false
        },
        WALL_TOP: {
            name: 'WALL_TOP',
            char: '#',
            sprite: SpriteFactory_2.default.WALL_TOP(),
            isBlocking: true
        },
        WALL_HALL: {
            name: 'WALL_HALL',
            char: '#',
            sprite: SpriteFactory_2.default.WALL_HALL(),
            isBlocking: true
        },
        WALL: {
            name: 'WALL',
            char: ' ',
            sprite: null,
            isBlocking: true
        },
        NONE: {
            name: 'NONE',
            char: ' ',
            sprite: null,
            isBlocking: true
        },
        STAIRS_DOWN: {
            name: 'STAIRS_DOWN',
            char: '>',
            sprite: SpriteFactory_2.default.STAIRS_DOWN(),
            isBlocking: false
        }
    };
    exports.default = Tiles;
});
define("classes/MapInstance", ["require", "exports", "types/Tiles"], function (require, exports, Tiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MapInstance = /** @class */ (function () {
        function MapInstance(width, height, tiles, rooms, units, items) {
            this.width = width;
            this.height = height;
            this.tiles = tiles;
            this.rooms = rooms;
            this.units = units;
            this.items = items;
            this.revealedTiles = [];
        }
        MapInstance.prototype.getTile = function (_a) {
            var x = _a.x, y = _a.y;
            if (x < this.width && y < this.height) {
                return (this.tiles[y] || [])[x] || Tiles_1.default.NONE;
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
        MapInstance.prototype.removeItem = function (_a) {
            var x = _a.x, y = _a.y;
            var index = this.items.findIndex(function (i) { return (i.x === x && i.y === y); });
            this.items.splice(index, 1);
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
define("classes/MapSupplier", ["require", "exports", "classes/MapInstance"], function (require, exports, MapInstance_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createMap(mapSupplier) {
        var _a;
        var level = mapSupplier.level, width = mapSupplier.width, height = mapSupplier.height, tiles = mapSupplier.tiles, rooms = mapSupplier.rooms, playerUnitLocation = mapSupplier.playerUnitLocation, enemyUnitLocations = mapSupplier.enemyUnitLocations, enemyUnitSupplier = mapSupplier.enemyUnitSupplier, itemLocations = mapSupplier.itemLocations, itemSupplier = mapSupplier.itemSupplier;
        var playerUnit = jwb.state.playerUnit;
        var units = [playerUnit];
        _a = [playerUnitLocation.x, playerUnitLocation.y], playerUnit.x = _a[0], playerUnit.y = _a[1];
        units.push.apply(units, enemyUnitLocations.map(function (_a) {
            var x = _a.x, y = _a.y;
            return enemyUnitSupplier({ x: x, y: y }, level);
        }));
        var items = itemLocations.map(function (_a) {
            var x = _a.x, y = _a.y;
            return itemSupplier({ x: x, y: y }, level);
        });
        return new MapInstance_1.default(width, height, tiles, rooms, units, items);
    }
    exports.createMap = createMap;
});
define("classes/GameState", ["require", "exports", "types"], function (require, exports, types_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GameState = /** @class */ (function () {
        function GameState(playerUnit, mapSuppliers) {
            this.screen = types_4.GameScreen.GAME;
            this.playerUnit = playerUnit;
            this.mapSuppliers = mapSuppliers;
            this.mapIndex = 0;
            this._map = null;
            this.messages = [];
            this.turn = 1;
        }
        GameState.prototype.getMap = function () {
            if (!this._map) {
                throw "fux";
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
define("classes/SpriteRenderer", ["require", "exports", "utils/MapUtils", "types", "actions", "utils/PromiseUtils", "types/Colors"], function (require, exports, MapUtils_4, types_5, actions_1, PromiseUtils_4, Colors_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TILE_WIDTH = 32;
    var TILE_HEIGHT = 24;
    var WIDTH = 20; // in tiles
    var HEIGHT = 20; // in tiles
    var SCREEN_WIDTH = 640;
    var SCREEN_HEIGHT = 480;
    var BOTTOM_PANEL_HEIGHT = 4 * TILE_HEIGHT;
    var BOTTOM_PANEL_WIDTH = 6 * TILE_WIDTH;
    var BOTTOM_BAR_WIDTH = 8 * TILE_WIDTH;
    var BOTTOM_BAR_HEIGHT = 2 * TILE_HEIGHT;
    var INVENTORY_LEFT = 2 * TILE_WIDTH;
    var INVENTORY_TOP = 2 * TILE_HEIGHT;
    var INVENTORY_WIDTH = 16 * TILE_WIDTH;
    var INVENTORY_HEIGHT = 12 * TILE_HEIGHT;
    var LINE_HEIGHT = 16;
    var SpriteRenderer = /** @class */ (function () {
        function SpriteRenderer() {
            this._container = document.getElementById('container');
            this._container.innerHTML = '';
            this._canvas = document.createElement('canvas');
            this._canvas.width = WIDTH * TILE_WIDTH;
            this._canvas.height = HEIGHT * TILE_HEIGHT;
            this._container.appendChild(this._canvas);
            this._context = this._canvas.getContext('2d');
            this._context.imageSmoothingEnabled = false;
            this._context.textBaseline = 'middle';
        }
        SpriteRenderer.prototype.render = function () {
            var _this = this;
            var screen = jwb.state.screen;
            switch (screen) {
                case 'GAME':
                    return this._renderGameScreen();
                case 'INVENTORY':
                    return this._renderGameScreen()
                        .then(function () { return _this._renderInventory(); });
                default:
                    throw "Invalid screen " + screen;
            }
        };
        SpriteRenderer.prototype._renderGameScreen = function () {
            var _this = this;
            actions_1.revealTiles();
            this._context.fillStyle = '#000';
            this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
            return PromiseUtils_4.chainPromises([
                function () { return _this._renderTiles(); },
                function () { return _this._renderItems(); },
                function () { return _this._renderUnits(); },
                function () { return Promise.all([_this._renderPlayerInfo(), _this._renderBottomBar(), _this._renderMessages()]); }
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
            var map = jwb.state.getMap();
            var promises = [];
            for (var y = 0; y < map.height; y++) {
                for (var x = 0; x < map.width; x++) {
                    if (MapUtils_4.isTileRevealed({ x: x, y: y })) {
                        var item = map.getItem({ x: x, y: y });
                        if (!!item) {
                            promises.push(this._drawEllipse({ x: x, y: y }, '#888', TILE_WIDTH * 3 / 8, TILE_HEIGHT * 3 / 8));
                            promises.push(this._renderElement(item, { x: x, y: y }));
                        }
                    }
                }
            }
            return Promise.all(promises);
        };
        SpriteRenderer.prototype._renderUnits = function () {
            var playerUnit = jwb.state.playerUnit;
            var map = jwb.state.getMap();
            var promises = [];
            for (var y = 0; y < map.height; y++) {
                for (var x = 0; x < map.width; x++) {
                    if (MapUtils_4.isTileRevealed({ x: x, y: y })) {
                        var unit = map.getUnit({ x: x, y: y });
                        if (!!unit) {
                            if (unit === playerUnit) {
                                promises.push(this._drawEllipse({ x: x, y: y }, '#0f0', TILE_WIDTH * 3 / 8, TILE_HEIGHT * 3 / 8));
                            }
                            else {
                                promises.push(this._drawEllipse({ x: x, y: y }, '#888', TILE_WIDTH * 3 / 8, TILE_HEIGHT * 3 / 8));
                            }
                            promises.push(this._renderElement(unit, { x: x, y: y }));
                        }
                    }
                }
            }
            return Promise.all(promises);
        };
        /**
         * @param color (in hex form)
         */
        SpriteRenderer.prototype._drawEllipse = function (_a, color, width, height) {
            var x = _a.x, y = _a.y;
            var _context = this._context;
            _context.fillStyle = color;
            var topLeftPixel = this._gridToPixel({ x: x, y: y });
            var _b = [topLeftPixel.x + TILE_WIDTH / 2, topLeftPixel.y + TILE_HEIGHT / 2], cx = _b[0], cy = _b[1];
            _context.moveTo(cx, cy);
            _context.beginPath();
            _context.ellipse(cx, cy, width, height, 0, 0, 2 * Math.PI);
            _context.fill();
            return new Promise(function (resolve) { resolve(); });
        };
        SpriteRenderer.prototype._renderInventory = function () {
            var playerUnit = jwb.state.playerUnit;
            var inventory = playerUnit.inventory;
            var _a = this, _canvas = _a._canvas, _context = _a._context;
            this._drawRect({ left: INVENTORY_LEFT, top: INVENTORY_TOP, width: INVENTORY_WIDTH, height: INVENTORY_HEIGHT });
            // draw equipment
            var equipmentLeft = INVENTORY_LEFT + TILE_WIDTH;
            var inventoryLeft = (_canvas.width + TILE_WIDTH) / 2;
            // draw titles
            _context.fillStyle = '#fff';
            _context.textAlign = 'center';
            _context.font = '20px Monospace';
            _context.fillText('EQUIPMENT', _canvas.width / 4, INVENTORY_TOP + 12);
            _context.fillText('INVENTORY', _canvas.width * 3 / 4, INVENTORY_TOP + 12);
            // draw equipment items
            // for now, just display them all in one list
            _context.font = '10px sans-serif';
            _context.textAlign = 'left';
            var y = INVENTORY_TOP + 64;
            playerUnit.equipment.getEntries().forEach(function (_a) {
                var slot = _a[0], equipmentList = _a[1];
                equipmentList.forEach(function (equipment) {
                    _context.fillText(slot + " - " + equipment.name, equipmentLeft, y);
                    y += LINE_HEIGHT;
                });
            });
            // draw inventory categories
            var inventoryCategories = Object.values(types_5.ItemCategory);
            var categoryWidth = 60;
            var xOffset = 4;
            _context.font = '14px Monospace';
            _context.textAlign = 'center';
            for (var i = 0; i < inventoryCategories.length; i++) {
                var x = inventoryLeft + i * categoryWidth + (categoryWidth / 2) + xOffset;
                _context.fillText(inventoryCategories[i], x, INVENTORY_TOP + 40);
                if (inventoryCategories[i] === inventory.selectedCategory) {
                    _context.fillRect(x - (categoryWidth / 2) + 4, INVENTORY_TOP + 48, categoryWidth - 8, 1);
                }
            }
            // draw inventory items
            if (inventory.selectedCategory) {
                var items = inventory.get(inventory.selectedCategory);
                var x = inventoryLeft + 8;
                _context.font = '10px sans-serif';
                _context.textAlign = 'left';
                for (var i = 0; i < items.length; i++) {
                    var y_1 = INVENTORY_TOP + 64 + LINE_HEIGHT * i;
                    if (items[i] === inventory.selectedItem) {
                        _context.fillStyle = '#fc0';
                    }
                    else {
                        _context.fillStyle = '#fff';
                    }
                    _context.fillText(items[i].name, x, y_1);
                }
                _context.fillStyle = '#fff';
            }
            return PromiseUtils_4.resolvedPromise();
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
            return PromiseUtils_4.resolvedPromise();
        };
        SpriteRenderer.prototype._drawSprite = function (sprite, _a) {
            var _this = this;
            var x = _a.x, y = _a.y;
            return sprite.getImage()
                .then(function (image) { return _this._context.drawImage(image, x + sprite.dx, y + sprite.dy); });
        };
        /**
         * Renders the bottom-left area of the screen, showing information about the player
         */
        SpriteRenderer.prototype._renderPlayerInfo = function () {
            var _this = this;
            var _context = this._context;
            return new Promise(function (resolve) {
                var playerUnit = jwb.state.playerUnit;
                var top = SCREEN_HEIGHT - BOTTOM_PANEL_HEIGHT;
                _this._drawRect({ left: 0, top: top, width: BOTTOM_PANEL_WIDTH, height: BOTTOM_PANEL_HEIGHT });
                var lines = [
                    playerUnit.name,
                    "Level " + playerUnit.level,
                    "Life: " + playerUnit.life + "/" + playerUnit.maxLife,
                    "Damage: " + playerUnit.getDamage(),
                ];
                var experienceToNextLevel = playerUnit.experienceToNextLevel();
                if (experienceToNextLevel !== null) {
                    lines.push("Experience: " + playerUnit.experience + "/" + experienceToNextLevel);
                }
                _context.fillStyle = '#fff';
                _context.textAlign = 'left';
                _context.font = '10px sans-serif';
                var left = 4;
                for (var i = 0; i < lines.length; i++) {
                    var y = top + (LINE_HEIGHT / 2) + (LINE_HEIGHT * i);
                    _context.fillText(lines[i], left, y);
                }
                resolve();
            });
        };
        SpriteRenderer.prototype._renderMessages = function () {
            var _this = this;
            var _context = this._context;
            return new Promise(function (resolve) {
                var messages = jwb.state.messages;
                _context.fillStyle = '#000';
                _context.strokeStyle = '#fff';
                var left = SCREEN_WIDTH - BOTTOM_PANEL_WIDTH;
                var top = SCREEN_HEIGHT - BOTTOM_PANEL_HEIGHT;
                _this._drawRect({ left: left, top: top, width: BOTTOM_PANEL_WIDTH, height: BOTTOM_PANEL_HEIGHT });
                _context.fillStyle = '#fff';
                _context.textAlign = 'left';
                _context.font = '10px sans-serif';
                var textLeft = left + 4;
                for (var i = 0; i < messages.length; i++) {
                    var y = top + (LINE_HEIGHT / 2) + (LINE_HEIGHT * i);
                    _context.fillText(messages[i], textLeft, y);
                }
                resolve();
            });
        };
        SpriteRenderer.prototype._renderBottomBar = function () {
            var _context = this._context;
            var left = BOTTOM_PANEL_WIDTH;
            var top = SCREEN_HEIGHT - BOTTOM_BAR_HEIGHT;
            var width = SCREEN_WIDTH - 2 * BOTTOM_PANEL_WIDTH;
            this._drawRect({ left: left, top: top, width: width, height: BOTTOM_BAR_HEIGHT });
            var _a = jwb.state, mapIndex = _a.mapIndex, turn = _a.turn;
            _context.textAlign = 'left';
            _context.fillStyle = Colors_4.default.WHITE;
            var textLeft = left + 4;
            _context.fillText("Level: " + ((mapIndex || 0) + 1), textLeft, top + 8);
            _context.fillText("Turn: " + turn, textLeft, top + 8 + LINE_HEIGHT);
            return PromiseUtils_4.resolvedPromise();
        };
        SpriteRenderer.prototype._drawRect = function (_a) {
            var left = _a.left, top = _a.top, width = _a.width, height = _a.height;
            var _context = this._context;
            _context.fillStyle = Colors_4.default.BLACK;
            _context.fillRect(left, top, width, height);
            _context.strokeStyle = Colors_4.default.WHITE;
            _context.strokeRect(left, top, width, height);
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
        return SpriteRenderer;
    }());
    exports.default = SpriteRenderer;
});
define("ItemFactory", ["require", "exports", "Sounds", "classes/InventoryItem", "types", "utils/AudioUtils", "utils/PromiseUtils", "utils/RandomUtils", "SpriteFactory", "EquipmentClasses", "classes/MapItem"], function (require, exports, Sounds_3, InventoryItem_1, types_6, AudioUtils_3, PromiseUtils_5, RandomUtils_5, SpriteFactory_3, EquipmentClasses_1, MapItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createPotion(lifeRestored) {
        var onUse = function (item, unit) {
            return new Promise(function (resolve) {
                AudioUtils_3.playSound(Sounds_3.default.USE_POTION);
                var prevLife = unit.life;
                unit.life = Math.min(unit.life + lifeRestored, unit.maxLife);
                jwb.state.messages.push(unit.name + " used " + item.name + " and gained " + (unit.life - prevLife) + " life.");
                resolve();
            });
        };
        return new InventoryItem_1.default('Potion', types_6.ItemCategory.POTION, onUse);
    }
    function _equipEquipment(equipmentClass, item, unit) {
        return new Promise(function (resolve) {
            var equippedItem = {
                name: equipmentClass.name,
                category: equipmentClass.equipmentCategory,
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
            adjacentUnits.forEach(function (u) {
                promises.push(function () { return u.takeDamage(damage, unit); });
            });
            return PromiseUtils_5.chainPromises(promises);
        };
        return new InventoryItem_1.default('Scroll of Floor Fire', types_6.ItemCategory.SCROLL, onUse);
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
            var inventoryItem = createPotion(50);
            return new MapItem_1.default({ x: x, y: y }, 'K', sprite, inventoryItem);
        };
        var createFloorFireScroll = function (_a) {
            var x = _a.x, y = _a.y;
            var sprite = SpriteFactory_3.default.MAP_SCROLL();
            var inventoryItem = createScrollOfFloorFire(200);
            return new MapItem_1.default({ x: x, y: y }, 'K', sprite, inventoryItem);
        };
        return [createMapPotion, createFloorFireScroll];
    }
    function _getWeaponSuppliers(level) {
        return EquipmentClasses_1.default.getWeaponClasses()
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
        return RandomUtils_5.randChoice(suppliers)({ x: x, y: y });
    }
    exports.default = {
        createRandomItem: createRandomItem
    };
});
define("UnitClasses", ["require", "exports", "SpriteFactory", "UnitAI", "types/Colors"], function (require, exports, SpriteFactory_4, UnitAI_1, Colors_5) {
    "use strict";
    var _a, _b, _c, _d;
    Object.defineProperty(exports, "__esModule", { value: true });
    var PLAYER = {
        name: 'PLAYER',
        sprite: SpriteFactory_4.default.PLAYER,
        // Green/brown colors
        paletteSwaps: (_a = {},
            _a[Colors_5.default.DARK_PURPLE] = Colors_5.default.DARK_BROWN,
            _a[Colors_5.default.MAGENTA] = Colors_5.default.DARK_GREEN,
            _a[Colors_5.default.DARK_BLUE] = Colors_5.default.DARK_GREEN,
            _a[Colors_5.default.CYAN] = Colors_5.default.LIGHT_PINK,
            _a[Colors_5.default.BLACK] = Colors_5.default.BLACK,
            _a[Colors_5.default.DARK_GRAY] = Colors_5.default.DARK_BROWN,
            _a[Colors_5.default.LIGHT_GRAY] = Colors_5.default.LIGHT_BROWN,
            _a[Colors_5.default.DARK_GREEN] = Colors_5.default.DARK_BROWN,
            _a[Colors_5.default.GREEN] = Colors_5.default.DARK_BROWN,
            _a[Colors_5.default.ORANGE] = Colors_5.default.LIGHT_PINK // Face
        ,
            _a),
        startingLife: 100,
        startingDamage: 10,
        minLevel: 1,
        maxLevel: 20,
        lifePerLevel: function (level) { return 10; },
        damagePerLevel: function (level) { return 2; },
        experienceToNextLevel: function (currentLevel) { return (currentLevel < 10) ? 2 * currentLevel + 4 : null; },
    };
    var ENEMY_HUMAN_BLUE = {
        name: 'ENEMY_HUMAN_BLUE',
        sprite: SpriteFactory_4.default.PLAYER,
        paletteSwaps: (_b = {},
            _b[Colors_5.default.DARK_PURPLE] = Colors_5.default.MEDIUM_BLUE,
            _b[Colors_5.default.MAGENTA] = Colors_5.default.MEDIUM_BLUE,
            _b[Colors_5.default.DARK_BLUE] = Colors_5.default.MEDIUM_BLUE,
            _b[Colors_5.default.CYAN] = Colors_5.default.LIGHT_PINK,
            _b[Colors_5.default.BLACK] = Colors_5.default.MEDIUM_BLUE,
            _b[Colors_5.default.DARK_GRAY] = Colors_5.default.DARK_BLUE,
            _b[Colors_5.default.LIGHT_GRAY] = Colors_5.default.DARK_BLUE,
            _b[Colors_5.default.DARK_GREEN] = Colors_5.default.BLACK,
            _b[Colors_5.default.GREEN] = Colors_5.default.BLACK,
            _b[Colors_5.default.ORANGE] = Colors_5.default.LIGHT_PINK // Face
        ,
            _b),
        startingLife: 75,
        startingDamage: 4,
        minLevel: 1,
        maxLevel: 3,
        lifePerLevel: function () { return 12; },
        damagePerLevel: function () { return 2; },
        aiHandler: UnitAI_1.HUMAN_CAUTIOUS,
    };
    var ENEMY_HUMAN_RED = {
        name: 'ENEMY_HUMAN_RED',
        sprite: SpriteFactory_4.default.PLAYER,
        paletteSwaps: (_c = {},
            _c[Colors_5.default.DARK_PURPLE] = Colors_5.default.MEDIUM_RED,
            _c[Colors_5.default.MAGENTA] = Colors_5.default.MEDIUM_RED,
            _c[Colors_5.default.DARK_BLUE] = Colors_5.default.MEDIUM_RED,
            _c[Colors_5.default.CYAN] = Colors_5.default.LIGHT_PINK,
            _c[Colors_5.default.BLACK] = Colors_5.default.MEDIUM_RED,
            _c[Colors_5.default.DARK_GRAY] = Colors_5.default.DARK_RED,
            _c[Colors_5.default.LIGHT_GRAY] = Colors_5.default.DARK_RED,
            _c[Colors_5.default.DARK_GREEN] = Colors_5.default.BLACK,
            _c[Colors_5.default.GREEN] = Colors_5.default.BLACK,
            _c[Colors_5.default.ORANGE] = Colors_5.default.LIGHT_PINK // Face
        ,
            _c),
        startingLife: 55,
        startingDamage: 6,
        minLevel: 1,
        maxLevel: 5,
        lifePerLevel: function () { return 10; },
        damagePerLevel: function () { return 3; },
        aiHandler: UnitAI_1.HUMAN_AGGRESSIVE
    };
    var ENEMY_HUMAN_BLACK = {
        name: 'ENEMY_HUMAN_BLACK',
        sprite: SpriteFactory_4.default.PLAYER,
        paletteSwaps: (_d = {},
            _d[Colors_5.default.DARK_PURPLE] = Colors_5.default.DARKER_GRAY,
            _d[Colors_5.default.MAGENTA] = Colors_5.default.DARKER_GRAY,
            _d[Colors_5.default.DARK_BLUE] = Colors_5.default.DARKER_GRAY,
            _d[Colors_5.default.CYAN] = Colors_5.default.BLACK,
            _d[Colors_5.default.BLACK] = Colors_5.default.LIGHT_GRAY,
            _d[Colors_5.default.DARK_GRAY] = Colors_5.default.DARKER_GRAY,
            _d[Colors_5.default.LIGHT_GRAY] = Colors_5.default.DARKER_GRAY,
            _d[Colors_5.default.DARK_GREEN] = Colors_5.default.BLACK,
            _d[Colors_5.default.GREEN] = Colors_5.default.BLACK,
            _d[Colors_5.default.ORANGE] = Colors_5.default.LIGHT_GRAY,
            _d[Colors_5.default.TEAL] = Colors_5.default.RED,
            _d[Colors_5.default.LIGHT_BROWN] = Colors_5.default.LIGHT_GRAY // Hair
        ,
            _d),
        startingLife: 100,
        startingDamage: 10,
        minLevel: 3,
        maxLevel: 9,
        lifePerLevel: function () { return 18; },
        damagePerLevel: function () { return 4; },
        aiHandler: UnitAI_1.HUMAN_AGGRESSIVE
    };
    function getEnemyClasses() {
        return [ENEMY_HUMAN_BLUE, ENEMY_HUMAN_RED, ENEMY_HUMAN_BLACK];
    }
    exports.default = {
        PLAYER: PLAYER,
        ENEMY_HUMAN_BLUE: ENEMY_HUMAN_BLUE,
        ENEMY_HUMAN_RED: ENEMY_HUMAN_RED,
        ENEMY_HUMAN_BLACK: ENEMY_HUMAN_BLACK,
        getEnemyClasses: getEnemyClasses
    };
});
define("classes/DungeonGenerator", ["require", "exports", "utils/MapUtils", "utils/RandomUtils", "classes/Pathfinder", "types/Tiles"], function (require, exports, MapUtils_5, RandomUtils_6, Pathfinder_2, Tiles_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MAX_EXITS = 3;
    /**
     * Based on http://www.roguebasin.com/index.php?title=Basic_BSP_Dungeon_generation
     */
    var DungeonGenerator = /** @class */ (function () {
        /**
         * @param minRoomDimension outer width, including wall
         * @param maxRoomDimension outer width, including wall
         * @param minRoomPadding minimum padding between each room and its containing section
         */
        function DungeonGenerator(minRoomDimension, maxRoomDimension, minRoomPadding) {
            this.minRoomDimension = minRoomDimension;
            this.maxRoomDimension = maxRoomDimension;
            this.minRoomPadding = minRoomPadding;
        }
        DungeonGenerator.prototype.generateDungeon = function (level, width, height, numEnemies, enemyUnitSupplier, numItems, itemSupplier) {
            var _this = this;
            // Create a section with dimensions (width, height - 1) and then shift it down by one tile.
            // This is so we have room to add a WALL_TOP tile in the top slot if necessary
            var section = (function () {
                var section = _this._generateSection(width, height - 1);
                _this._joinSection(section);
                return {
                    width: width,
                    height: height,
                    rooms: section.rooms.map(function (room) { return ({
                        left: room.left,
                        top: room.top + 1,
                        width: room.width,
                        height: room.height,
                        exits: room.exits.map(function (_a) {
                            var x = _a.x, y = _a.y;
                            return ({ x: x, y: y + 1 });
                        })
                    }); }),
                    tiles: __spreadArrays([[]], section.tiles)
                };
            })();
            var tiles = section.tiles;
            var stairsLocation = MapUtils_5.pickUnoccupiedLocations(tiles, [Tiles_2.default.FLOOR], [], 1)[0];
            tiles[stairsLocation.y][stairsLocation.x] = Tiles_2.default.STAIRS_DOWN;
            var playerUnitLocation = MapUtils_5.pickUnoccupiedLocations(tiles, [Tiles_2.default.FLOOR, Tiles_2.default.FLOOR_HALL], [stairsLocation], 1)[0];
            var enemyUnitLocations = MapUtils_5.pickUnoccupiedLocations(tiles, [Tiles_2.default.FLOOR], [stairsLocation, playerUnitLocation], numEnemies);
            var itemLocations = MapUtils_5.pickUnoccupiedLocations(tiles, [Tiles_2.default.FLOOR], __spreadArrays([stairsLocation, playerUnitLocation], enemyUnitLocations), numItems);
            return {
                level: level,
                width: width,
                height: height,
                tiles: tiles,
                rooms: section.rooms,
                playerUnitLocation: playerUnitLocation,
                enemyUnitLocations: enemyUnitLocations,
                enemyUnitSupplier: enemyUnitSupplier,
                itemLocations: itemLocations,
                itemSupplier: itemSupplier
            };
        };
        /**
         * Generate a rectangular area of tiles with the specified dimensions, consisting of any number of rooms connected
         * by corridors.  To do so, split the area into two sub-areas and call this method recursively.  If this area is
         * not large enough to form two sub-regions, just return a single section.
         */
        DungeonGenerator.prototype._generateSection = function (width, height) {
            // First, make sure the area is large enough to support two sections; if not, we're done
            var minSectionDimension = this.minRoomDimension + (2 * this.minRoomPadding);
            var canSplitHorizontally = (width >= (2 * minSectionDimension));
            var canSplitVertically = (height >= (2 * minSectionDimension));
            var splitDirections = __spreadArrays((canSplitHorizontally ? ['HORIZONTAL'] : []), (canSplitVertically ? ['VERTICAL'] : []));
            if (splitDirections.length > 0) {
                var direction = RandomUtils_6.randChoice(splitDirections);
                if (direction === 'HORIZONTAL') {
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
                else if (direction === 'VERTICAL') {
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
            }
            // Base case: return a single section
            return this._generateSingleSection(width, height);
        };
        /**
         * Create a rectangular section of tiles, consisting of a room surrounded by empty spaces.  The room can be placed
         * anywhere in the region at random, and can occupy a variable amount of space in the region
         * (within the specified parameters).
         */
        DungeonGenerator.prototype._generateSingleSection = function (width, height) {
            var maxRoomWidth = width - (2 * this.minRoomPadding);
            var maxRoomHeight = height - (2 * this.minRoomPadding);
            console.assert(maxRoomWidth >= this.minRoomDimension && maxRoomHeight >= this.minRoomDimension, 'calculate room dimensions failed');
            var roomWidth = RandomUtils_6.randInt(this.minRoomDimension, maxRoomWidth);
            var roomHeight = RandomUtils_6.randInt(this.minRoomDimension, maxRoomHeight);
            var roomTiles = this._generateRoomTiles(roomWidth, roomHeight);
            var roomLeft = RandomUtils_6.randInt(this.minRoomPadding, width - roomWidth - this.minRoomPadding);
            var roomTop = RandomUtils_6.randInt(this.minRoomPadding, height - roomHeight - this.minRoomPadding);
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
                        tiles[y][x] = Tiles_2.default.NONE;
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
        DungeonGenerator.prototype._generateRoomTiles = function (width, height) {
            var tiles = [];
            for (var y = 0; y < height; y++) {
                tiles[y] = [];
                for (var x = 0; x < width; x++) {
                    if (x > 0 && x < (width - 1) && y === 0) {
                        tiles[y][x] = Tiles_2.default.WALL_TOP;
                    }
                    else if (x === 0 || x === (width - 1) || y === 0 || y === (height - 1)) {
                        tiles[y][x] = Tiles_2.default.WALL;
                    }
                    else {
                        tiles[y][x] = Tiles_2.default.FLOOR;
                    }
                }
            }
            return tiles;
        };
        /**
         * @param dimension width or height
         * @returns the min X/Y coordinate of the *second* room
         * @private
         */
        DungeonGenerator.prototype._getSplitPoint = function (dimension) {
            var minSectionDimension = this.minRoomDimension + 2 * this.minRoomPadding;
            var minSplitPoint = minSectionDimension;
            var maxSplitPoint = dimension - minSectionDimension;
            return RandomUtils_6.randInt(minSplitPoint, maxSplitPoint);
        };
        DungeonGenerator.prototype._joinSection = function (section) {
            var _this = this;
            var unconnectedRooms = __spreadArrays(section.rooms);
            var connectedRooms = [];
            var nextRoom = unconnectedRooms.pop();
            if (!!nextRoom) {
                connectedRooms.push(nextRoom);
            }
            while (unconnectedRooms.length > 0) {
                var candidatePairs_3 = connectedRooms
                    .flatMap(function (connectedRoom) { return unconnectedRooms.map(function (unconnectedRoom) { return [connectedRoom, unconnectedRoom]; }); })
                    .filter(function (_a) {
                    var connectedRoom = _a[0], unconnectedRoom = _a[1];
                    return _this._canJoinRooms(connectedRoom, unconnectedRoom);
                })
                    .sort(function (first, second) { return _this._roomDistance(first[0], first[1]) - _this._roomDistance(second[0], second[1]); });
                var joinedAnyRooms = false;
                for (var _i = 0, candidatePairs_1 = candidatePairs_3; _i < candidatePairs_1.length; _i++) {
                    var _a = candidatePairs_1[_i], connectedRoom = _a[0], unconnectedRoom = _a[1];
                    if (this._joinRooms(connectedRoom, unconnectedRoom, section)) {
                        unconnectedRooms.splice(unconnectedRooms.indexOf(unconnectedRoom), 1);
                        connectedRooms.push(unconnectedRoom);
                        joinedAnyRooms = true;
                        break;
                    }
                }
                if (!joinedAnyRooms) {
                    console.error('Couldn\'t connect rooms!');
                    break;
                }
            }
            // add some extra connections for fun
            var candidatePairs = connectedRooms
                .flatMap(function (first) { return connectedRooms.map(function (second) { return [first, second]; }); })
                .filter(function (_a) {
                var first = _a[0], second = _a[1];
                return _this._canJoinRooms(first, second);
            });
            RandomUtils_6.shuffle(candidatePairs);
            if (candidatePairs.length > 0) {
                for (var _b = 0, candidatePairs_2 = candidatePairs; _b < candidatePairs_2.length; _b++) {
                    var _c = candidatePairs_2[_b], first = _c[0], second = _c[1];
                    if (this._canJoinRooms(first, second)) {
                        this._joinRooms(first, second, section); // don't care if it worked
                    }
                }
            }
            // add walls above corridor tiles if possible
            for (var y = 0; y < section.height; y++) {
                for (var x = 0; x < section.width; x++) {
                    if (y > 0) {
                        if (section.tiles[y][x] === Tiles_2.default.FLOOR_HALL) {
                            if (section.tiles[y - 1][x] === Tiles_2.default.NONE || section.tiles[y - 1][x] === Tiles_2.default.WALL) {
                                section.tiles[y - 1][x] = Tiles_2.default.WALL_HALL;
                            }
                        }
                    }
                }
            }
        };
        DungeonGenerator.prototype._roomDistance = function (first, second) {
            var firstCenter = { x: first.left + first.width / 2, y: first.top + first.height / 2 };
            var secondCenter = { x: second.left + second.width / 2, y: second.top + second.height / 2 };
            return MapUtils_5.hypotenuse(firstCenter, secondCenter);
        };
        DungeonGenerator.prototype._canJoinRooms = function (first, second) {
            return (first !== second) && (first.exits.length < MAX_EXITS) && (second.exits.length < MAX_EXITS);
        };
        DungeonGenerator.prototype._joinRooms = function (first, second, section) {
            var firstExitCandidates = this._getExitCandidates(first);
            var secondExitCandidates = this._getExitCandidates(second);
            RandomUtils_6.shuffle(firstExitCandidates);
            RandomUtils_6.shuffle(secondExitCandidates);
            for (var _i = 0, firstExitCandidates_1 = firstExitCandidates; _i < firstExitCandidates_1.length; _i++) {
                var firstExit = firstExitCandidates_1[_i];
                for (var _a = 0, secondExitCandidates_1 = secondExitCandidates; _a < secondExitCandidates_1.length; _a++) {
                    var secondExit = secondExitCandidates_1[_a];
                    if (this._joinExits(firstExit, secondExit, section)) {
                        first.exits.push(firstExit);
                        second.exits.push(secondExit);
                        return true;
                    }
                }
            }
            return false;
        };
        DungeonGenerator.prototype._getExitCandidates = function (room) {
            var eligibleSides = __spreadArrays((!room.exits.some(function (exit) { return exit.y === room.top; }) ? ['TOP'] : []), (!room.exits.some(function (exit) { return exit.x === room.left + room.width - 1; }) ? ['RIGHT'] : []), (!room.exits.some(function (exit) { return exit.y === room.top + room.height - 1; }) ? ['BOTTOM'] : []), (!room.exits.some(function (exit) { return exit.x === room.left; }) ? ['LEFT'] : []));
            if (eligibleSides.length === 0) {
                throw 'Error: out of eligible sides';
            }
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
            return candidates;
        };
        DungeonGenerator.prototype._joinExits = function (firstExit, secondExit, section) {
            var blockedTileDetector = function (_a) {
                var x = _a.x, y = _a.y;
                // can't draw a path through an existing room or a wall
                var blockedTileTypes = [Tiles_2.default.FLOOR, Tiles_2.default.WALL, Tiles_2.default.WALL_HALL, Tiles_2.default.WALL_TOP];
                if ([firstExit, secondExit].some(function (exit) { return MapUtils_5.coordinatesEquals({ x: x, y: y }, exit); })) {
                    return false;
                }
                else if (section.tiles[y][x] === Tiles_2.default.NONE || section.tiles[y][x] === Tiles_2.default.FLOOR_HALL) {
                    // skip the check if we're within 2 tiles of an exit
                    var isNextToExit = [-2, -1, 1, 2].some(function (dy) { return ([firstExit, secondExit].some(function (exit) { return MapUtils_5.coordinatesEquals(exit, { x: x, y: y + dy }); })); });
                    if (isNextToExit) {
                        return false;
                    }
                    // can't draw tiles near walls
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
            // prefer reusing floor hall tiles
            var tileCostCalculator = function (first, second) {
                return (section.tiles[second.y][second.x] === Tiles_2.default.FLOOR_HALL) ? 0.01 : 1;
            };
            var mapRect = {
                left: 0,
                top: 0,
                width: section.width,
                height: section.height
            };
            var path = new Pathfinder_2.default(blockedTileDetector, tileCostCalculator).findPath(firstExit, secondExit, mapRect);
            path.forEach(function (_a) {
                var x = _a.x, y = _a.y;
                section.tiles[y][x] = Tiles_2.default.FLOOR_HALL;
            });
            return (path.length > 0);
        };
        DungeonGenerator.prototype._logSections = function (name) {
            var sections = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                sections[_i - 1] = arguments[_i];
            }
            console.log("Sections for " + name + ":");
            sections.forEach(function (section) { return console.log(section.tiles
                .map(function (row) { return row.map(function (tile) { return tile.char; }).join(''); })
                .join('\n')); });
            console.log();
        };
        return DungeonGenerator;
    }());
    exports.default = DungeonGenerator;
});
define("UnitFactory", ["require", "exports", "UnitClasses", "utils/RandomUtils", "classes/Unit"], function (require, exports, UnitClasses_1, RandomUtils_7, Unit_1) {
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
define("MapFactory", ["require", "exports", "classes/Unit", "ItemFactory", "UnitClasses", "types/Tiles", "classes/DungeonGenerator", "UnitFactory"], function (require, exports, Unit_2, ItemFactory_1, UnitClasses_2, Tiles_3, DungeonGenerator_1, UnitFactory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MIN_ROOM_DIMENSION = 6;
    var MAX_ROOM_DIMENSION = 9;
    var MIN_ROOM_PADDING = 2;
    var FIXED_MAPS = [
        function () { return _mapFromAscii("\n              ###########\n              #.........#\n              #....U....#               \n              #.....................\n              #.........#          .\n              ###.#######          .\n                 .                 .\n#############      .                 .\n#...........#      .           ######.#####\n#...........#      .           #..........#\n#....@......#      .           #...U....>.#\n#...................           #..........#\n#...........#                  #.....U....#\n#......U....#                  ############\n#############\n", 1); },
        function () { return _mapFromAscii("\n###########################################\n#.........................................#\n#...............U............U............#\n#.........................................#\n#...........####################......U...#\n#...........#                  #..........#\n#...@.......#                  #..........#\n#...........#                  #..........#\n#...........#                  ############\n#############\n", 2); }
    ];
    function createRandomMap(level, width, height, numEnemies, numItems) {
        var dungeonGenerator = new DungeonGenerator_1.default(MIN_ROOM_DIMENSION, MAX_ROOM_DIMENSION, MIN_ROOM_PADDING);
        return dungeonGenerator.generateDungeon(level, width, height, numEnemies, UnitFactory_1.default.createRandomEnemy, numItems, ItemFactory_1.default.createRandomItem);
    }
    function _mapFromAscii(ascii, level) {
        var lines = ascii.split('\n').filter(function (line) { return !line.match(/^ *$/); });
        var tiles = [];
        var playerUnitLocation = null;
        var enemyUnitLocations = [];
        for (var y = 0; y < lines.length; y++) {
            var line = lines[y];
            var _loop_4 = function (x) {
                var c = line[x];
                var tile = Object.values(Tiles_3.default).filter(function (t) { return t.char === c; })[0] || null;
                if (!tile) {
                    if (c === '@') {
                        playerUnitLocation = { x: x, y: y };
                        tile = Tiles_3.default.FLOOR;
                    }
                    else if (c === 'U') {
                        enemyUnitLocations.push({ x: x, y: y });
                        tile = Tiles_3.default.FLOOR;
                    }
                    else {
                        tile = Tiles_3.default.NONE;
                    }
                }
                tiles[y] = tiles[y] || [];
                tiles[y][x] = tile;
            };
            for (var x = 0; x < line.length; x++) {
                _loop_4(x);
            }
        }
        var width = tiles.map(function (row) { return row.length; }).reduce(function (a, b) { return Math.max(a, b); }) + 1;
        var height = tiles.length;
        if (!playerUnitLocation) {
            throw 'No player unit location';
        }
        return {
            level: level,
            width: width,
            height: height,
            tiles: tiles,
            rooms: [],
            playerUnitLocation: playerUnitLocation,
            enemyUnitLocations: enemyUnitLocations,
            enemyUnitSupplier: function (_a) {
                var x = _a.x, y = _a.y;
                return new Unit_2.default(UnitClasses_2.default.ENEMY_HUMAN_BLUE, 'enemy_blue', level, { x: x, y: y });
            },
            itemLocations: [],
            itemSupplier: function () {
                throw 'unsupported';
            }
        };
    }
    exports.default = { randomMap: createRandomMap, FIXED_MAPS: FIXED_MAPS };
});
define("Music", ["require", "exports", "utils/RandomUtils", "utils/AudioUtils"], function (require, exports, RandomUtils_8, AudioUtils_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function transpose_8va(_a) {
        var freq = _a[0], ms = _a[1];
        return [freq * 2, ms];
    }
    function transpose_8vb(_a) {
        var freq = _a[0], ms = _a[1];
        return [freq / 2, ms];
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
    var SUITE_2 = (function () {
        var FIGURE_1 = [[100, 1000], [80, 1000], [120, 1000], [80, 1000]]
            .map(transpose_8va);
        var FIGURE_2 = [[50, 1000], [80, 1000], [200, 1000], [240, 750], [230, 250]]
            //const FIGURE_2 = [[50,1000],[80,1000],[200,1000],[240,750],[/*230*/225,250]]
            .map(transpose_8va).map(transpose_8va);
        var FIGURE_3 = [[300, 500], [240, 500], [225, 1000], [200, 750], [150, 250], [180, 1000]];
        // const FIGURE_3 = [[300,500],[/*235*/240,500],[225,1000],[200,750],[150,250],[180,1000]];
        var FIGURE_4 = [[50, 250], [80, 250], [100, 500], [80, 250], [100, 250], [225, 125], [200, 125], [180, 125], [150, 125], [50, 250], [80, 250], [100, 500], [80, 250], [100, 250], [225, 125], [200, 125], [180, 125], [150, 125]]
            .map(transpose_8va).map(transpose_8va);
        var FIGURE_5 = [[300, 500], [200, 1000], [225, 500], [240, 500], [150, 1000], [100, 250], [180, 250]];
        //const FIGURE_5 = [[300,500],[200,1000],[225,500],[/*235*/240,500],[150,1000],[100,250],[180,250]];
        var FIGURE_6 = [[100, 250], [0, 250], [100, 250], [0, 250], [100, 250], [0, 250], [100, 250], [120, 250], [100, 250], [0, 250], [100, 250], [0, 250], [80, 250], [100, 250], [80, 250], [90, 250]]
            .map(transpose_8va);
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
    var SUITE_3 = (function () {
        var FIGURE_1 = [[100, 400], [0, 200], [50, 100], [0, 100], [100, 200], [50, 200], [100, 200], [0, 200], [100, 400], [0, 200], [50, 100], [0, 100], [100, 200], [50, 200], [100, 200], [0, 200], [80, 400], [0, 200], [40, 100], [0, 100], [80, 200], [40, 200], [80, 200], [0, 200], [80, 400], [0, 200], [40, 100], [0, 100], [80, 200], [40, 200], [80, 200], [0, 200]]
            .map(transpose_8va);
        var FIGURE_2 = [[200, 1400], [100, 200], [235, 800], [225, 800], [270, 1600], [300, 800], [270, 400], [235, 200], [225, 200]];
        var FIGURE_3 = [[75, 1600], [80, 1600], [100, 3200]]
            .map(transpose_8va);
        var FIGURE_4 = [[300, 200], [280, 400], [235, 100], [200, 100], [240, 400], [225, 200], [200, 100], [0, 100], [300, 200], [280, 400], [235, 100], [200, 100], [240, 400], [225, 200], [200, 100], [0, 100], [300, 200], [280, 400], [235, 100], [200, 100], [240, 400], [225, 200], [200, 100], [0, 100], [300, 200], [280, 400], [235, 100], [200, 100], [240, 400], [225, 200], [200, 100], [0, 100]];
        var FIGURE_5 = [[200, 800], [225, 400], [235, 400], [200, 200], [150, 200], [100, 400], [180, 800], [160, 600], [100, 200], [150, 200], [160, 200], [100, 400], [120, 200], [150, 200], [180, 400], [230, 800]]
            .map(transpose_8va);
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
    var currentSuite = null;
    function playSuite(suite) {
        var sections = Object.values(suite.sections);
        var numRepeats = 4;
        var _loop_5 = function (i) {
            var section = sections[i];
            var bass = (!!section.bass) ? RandomUtils_8.randChoice(section.bass) : null;
            var lead;
            if (!!section.lead) {
                do {
                    lead = RandomUtils_8.randChoice(section.lead);
                } while (lead === bass);
            }
            for (var j = 0; j < numRepeats; j++) {
                setTimeout(function () {
                    var figures = __spreadArrays((!!bass ? [bass.map(transpose_8vb)] : []), (!!lead ? [lead] : []));
                    figures.forEach(function (figure) { return AudioUtils_4.playMusic(figure); });
                }, ((numRepeats * i) + j) * suite.length);
            }
        };
        for (var i = 0; i < sections.length; i++) {
            _loop_5(i);
        }
        setTimeout(function () { return playSuite(suite); }, sections.length * suite.length * numRepeats);
    }
    exports.default = {
        SUITE_1: SUITE_1,
        SUITE_2: SUITE_2,
        SUITE_3: SUITE_3,
        currentSuite: currentSuite,
        playSuite: playSuite
    };
});
define("actions", ["require", "exports", "classes/GameState", "classes/Unit", "classes/SpriteRenderer", "MapFactory", "UnitClasses", "Music", "utils/MapUtils", "classes/MapSupplier", "InputHandler"], function (require, exports, GameState_1, Unit_3, SpriteRenderer_1, MapFactory_1, UnitClasses_3, Music_1, MapUtils_6, MapSupplier_1, InputHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function loadMap(index) {
        var state = jwb.state;
        if (index >= state.mapSuppliers.length) {
            alert('YOU WIN!');
        }
        else {
            state.mapIndex = index;
            state.setMap(MapSupplier_1.createMap(state.mapSuppliers[index]));
        }
    }
    exports.loadMap = loadMap;
    function restartGame() {
        var playerUnit = new Unit_3.default(UnitClasses_3.default.PLAYER, 'player', 1, { x: 0, y: 0 });
        jwb.state = new GameState_1.default(playerUnit, [
            // test
            //MapFactory.randomMap(20, 10, 3, 1),
            MapFactory_1.default.randomMap(1, 30, 22, 5, 4),
            MapFactory_1.default.randomMap(2, 32, 23, 6, 4),
            MapFactory_1.default.randomMap(3, 34, 24, 7, 3),
            MapFactory_1.default.randomMap(4, 36, 25, 8, 3),
            MapFactory_1.default.randomMap(5, 38, 26, 9, 3),
            MapFactory_1.default.randomMap(6, 30, 27, 10, 3)
        ]);
        jwb.renderer = new SpriteRenderer_1.default();
        loadMap(0);
        InputHandler_1.attachEvents();
        jwb.renderer.render();
        //Music.playSuite(randChoice([Music.SUITE_1, Music.SUITE_2]));
        Music_1.default.playSuite(Music_1.default.SUITE_3);
    }
    exports.restartGame = restartGame;
    /**
     * Add any tiles the player can currently see to the map's revealed tiles list.
     */
    function revealTiles() {
        var playerUnit = jwb.state.playerUnit;
        var map = jwb.state.getMap();
        map.rooms.forEach(function (room) {
            if (MapUtils_6.contains(room, playerUnit)) {
                for (var y = room.top; y < room.top + room.height; y++) {
                    for (var x = room.left; x < room.left + room.width; x++) {
                        if (!MapUtils_6.isTileRevealed({ x: x, y: y })) {
                            map.revealedTiles.push({ x: x, y: y });
                        }
                    }
                }
            }
        });
        var radius = 2;
        for (var y = playerUnit.y - radius; y <= playerUnit.y + radius; y++) {
            for (var x = playerUnit.x - radius; x <= playerUnit.x + radius; x++) {
                if (!MapUtils_6.isTileRevealed({ x: x, y: y })) {
                    map.revealedTiles.push({ x: x, y: y });
                }
            }
        }
    }
    exports.revealTiles = revealTiles;
});
define("classes/TurnHandler", ["require", "exports", "utils/PromiseUtils"], function (require, exports, PromiseUtils_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function playTurn(playerUnitOrder, doUpdate) {
        var renderer = jwb.renderer;
        var playerUnit = jwb.state.playerUnit;
        if (doUpdate) {
            playerUnit.queuedOrder = !!playerUnitOrder ? (function () { return playerUnitOrder(playerUnit); }) : null;
            return update();
        }
        else {
            return renderer.render();
        }
    }
    function update() {
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
        return PromiseUtils_6.chainPromises(unitPromises)
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
define("utils/ItemUtils", ["require", "exports", "utils/AudioUtils", "Sounds"], function (require, exports, AudioUtils_5, Sounds_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function pickupItem(unit, mapItem) {
        var state = jwb.state;
        var inventoryItem = mapItem.inventoryItem;
        unit.inventory.add(inventoryItem);
        state.messages.push("Picked up a " + inventoryItem.name + ".");
        AudioUtils_5.playSound(Sounds_4.default.PICK_UP_ITEM);
    }
    exports.pickupItem = pickupItem;
    function useItem(unit, item) {
        return item.use(unit)
            .then(function () { return unit.inventory.remove(item); });
    }
    exports.useItem = useItem;
});
define("InputHandler", ["require", "exports", "actions", "types", "classes/TurnHandler", "types/Tiles", "Sounds", "utils/ItemUtils", "utils/PromiseUtils", "utils/UnitUtils", "utils/AudioUtils"], function (require, exports, actions_2, types_7, TurnHandler_1, Tiles_4, Sounds_5, ItemUtils_1, PromiseUtils_7, UnitUtils_2, AudioUtils_6) {
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
                return TurnHandler_1.default.playTurn(null, true);
            case KeyCommand.ENTER:
                return _handleEnter();
            case KeyCommand.TAB:
                e.preventDefault();
                return _handleTab();
            default:
        }
        return PromiseUtils_7.resolvedPromise();
    }
    exports.simulateKeyPress = keyHandler;
    function _handleArrowKey(command) {
        var _a, _b, _c, _d;
        var screen = jwb.state.screen;
        switch (screen) {
            case types_7.GameScreen.GAME:
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
                return TurnHandler_1.default.playTurn(queuedOrder, true);
            case types_7.GameScreen.INVENTORY:
                var state = jwb.state;
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
                return TurnHandler_1.default.playTurn(null, false);
            default:
                throw "fux";
        }
    }
    function _handleEnter() {
        var state = jwb.state;
        var playerUnit = state.playerUnit, screen = state.screen;
        switch (screen) {
            case types_7.GameScreen.GAME: {
                var mapIndex = state.mapIndex;
                var map = state.getMap();
                var x = playerUnit.x, y = playerUnit.y;
                if (!map || (mapIndex === null)) {
                    throw "fux";
                }
                var item = map.getItem({ x: x, y: y });
                if (!!item) {
                    ItemUtils_1.pickupItem(playerUnit, item);
                    map.removeItem({ x: x, y: y });
                }
                else if (map.getTile({ x: x, y: y }) === Tiles_4.default.STAIRS_DOWN) {
                    AudioUtils_6.playSound(Sounds_5.default.DESCEND_STAIRS);
                    actions_2.loadMap(mapIndex + 1);
                }
                return TurnHandler_1.default.playTurn(null, true);
            }
            case types_7.GameScreen.INVENTORY: {
                var playerUnit_1 = state.playerUnit;
                var selectedItem = playerUnit_1.inventory.selectedItem;
                if (!!selectedItem) {
                    state.screen = types_7.GameScreen.GAME;
                    return ItemUtils_1.useItem(playerUnit_1, selectedItem)
                        .then(function () { return TurnHandler_1.default.playTurn(null, false); });
                }
                return PromiseUtils_7.resolvedPromise();
            }
            default:
                throw "fux";
        }
    }
    function _handleTab() {
        var state = jwb.state;
        switch (state.screen) {
            case types_7.GameScreen.INVENTORY:
                state.screen = types_7.GameScreen.GAME;
                break;
            default:
                state.screen = types_7.GameScreen.INVENTORY;
                break;
        }
        return TurnHandler_1.default.playTurn(null, false);
    }
    function attachEvents() {
        window.onkeydown = keyHandlerWrapper;
    }
    exports.attachEvents = attachEvents;
});
define("globals", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("main", ["require", "exports", "actions"], function (require, exports, actions_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // @ts-ignore
    window.jwb = window.jwb || {};
    window.onload = function () { return actions_3.restartGame(); };
});
define("classes/AsciiRenderer", ["require", "exports", "utils/PromiseUtils", "classes/Unit"], function (require, exports, PromiseUtils_8, Unit_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WIDTH = 80;
    var HEIGHT = 32;
    var AsciiRenderer = /** @class */ (function () {
        function AsciiRenderer() {
            this._container = document.getElementById('container');
            this._container.innerHTML = '';
            this._pre = document.createElement('pre');
            this._container.appendChild(this._pre);
        }
        AsciiRenderer.prototype.render = function () {
            var screen = jwb.state.screen;
            switch (screen) {
                case 'GAME':
                    return this._renderGameScreen();
                case 'INVENTORY':
                    return this._renderInventoryScreen();
                default:
                    throw "Invalid screen " + screen;
            }
        };
        AsciiRenderer.prototype._renderGameScreen = function () {
            var map = jwb.state.getMap();
            var lines = ['', '', '']; // extra room for messages
            var mapHeight = HEIGHT - 7;
            for (var y = 0; y < mapHeight; y++) {
                var line = '';
                for (var x = 0; x < WIDTH; x++) {
                    if (map.contains({ x: x, y: y })) {
                        var element = map.getUnit({ x: x, y: y }) || map.getItem({ x: x, y: y }) || map.getTile({ x: x, y: y });
                        line += this._renderElement(element);
                    }
                    else {
                        line += ' ';
                    }
                }
                lines.push(line);
            }
            lines.push('', '', '');
            lines.push(this._getStatusLine());
            this._addMessageLines(lines);
            this._pre.innerHTML = lines.map(function (line) { return line.padEnd(WIDTH, ' '); }).join('\n');
            return PromiseUtils_8.resolvedPromise();
        };
        AsciiRenderer.prototype._renderInventoryScreen = function () {
            var state = jwb.state;
            var playerUnit = state.playerUnit;
            var inventory = playerUnit.inventory;
            var inventoryLines = [];
            var items = inventory.get(inventory.selectedCategory);
            inventoryLines.push(inventory.selectedCategory);
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item === inventory.selectedItem) {
                    inventoryLines.push("<span style=\"color: #f00\">" + item.name + "</span>");
                }
                else {
                    inventoryLines.push(item.name);
                }
            }
            var lines = ['INVENTORY', ''];
            for (var y = 0; y < HEIGHT - 3; y++) {
                var line = (y < inventoryLines.length) ? inventoryLines[y] : '';
                lines.push(line);
            }
            lines.push(this._getStatusLine());
            this._addMessageLines(lines);
            this._pre.innerHTML = lines.map(function (line) { return line.padEnd(WIDTH, ' '); }).join('\n');
            return PromiseUtils_8.resolvedPromise();
        };
        AsciiRenderer.prototype._renderElement = function (element) {
            if (element instanceof Unit_4.default) {
                return "<span style=\"color: " + ((element.name === 'player') ? '#0cf' : '#f00') + "\">@</span>";
            }
            else {
                return element.char;
            }
        };
        AsciiRenderer.prototype._getStatusLine = function () {
            var _a = jwb.state, playerUnit = _a.playerUnit, mapIndex = _a.mapIndex;
            return "HP: " + playerUnit.life + "/" + playerUnit.maxLife + "    Damage: " + playerUnit.getDamage() + "    Level: " + ((mapIndex || 0) + 1);
        };
        AsciiRenderer.prototype._addMessageLines = function (lines) {
            var messages = jwb.state.messages;
            for (var i = 0; i < messages.length; i++) {
                var message = messages.pop();
                if (!!message) {
                    lines[i] = message;
                }
            }
        };
        return AsciiRenderer;
    }());
    exports.default = AsciiRenderer;
});
//# sourceMappingURL=roguelike.js.map