var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
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
define("graphics/ImageUtils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function loadImage(filename) {
        return new Promise(function (resolve, reject) {
            var canvas = document.createElement('canvas');
            canvas.style.display = 'none';
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
    var ItemCategory;
    (function (ItemCategory) {
        ItemCategory["POTION"] = "POTION";
        ItemCategory["SCROLL"] = "SCROLL";
        ItemCategory["WEAPON"] = "WEAPON";
    })(ItemCategory || (ItemCategory = {}));
    exports.ItemCategory = ItemCategory;
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
    })(GameScreen || (GameScreen = {}));
    exports.GameScreen = GameScreen;
    var Activity;
    (function (Activity) {
        Activity["STANDING"] = "STANDING";
        Activity["WALKING"] = "WALKING";
        Activity["ATTACKING"] = "ATTACKING";
        Activity["DAMAGED"] = "DAMAGED";
    })(Activity || (Activity = {}));
    exports.Activity = Activity;
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
define("maps/MapUtils", ["require", "exports", "utils/ArrayUtils"], function (require, exports, ArrayUtils_1) {
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
define("utils/Pathfinder", ["require", "exports", "maps/MapUtils", "utils/RandomUtils"], function (require, exports, MapUtils_1, RandomUtils_1) {
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
                    var _a = RandomUtils_1.randChoice(bestNodes), chosenNode_1 = _a.node, chosenNodeCost_1 = _a.cost;
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
define("sounds/SoundPlayer", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SoundPlayer = /** @class */ (function () {
        function SoundPlayer(maxPolyphony, gain) {
            this._context = new AudioContext();
            this._gainNode = this._context.createGain();
            this._gainNode.gain.value = gain * 0.15; // sounds can be VERY loud
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
define("sounds/AudioUtils", ["require", "exports", "sounds/SoundPlayer"], function (require, exports, SoundPlayer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _getMusicPlayer = function () { return new SoundPlayer_1.default(4, 0.12); };
    var _getSoundPlayer = function () { return new SoundPlayer_1.default(4, 0.20); };
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
define("graphics/animations/Animations", ["require", "exports", "types/types", "utils/PromiseUtils"], function (require, exports, types_1, PromiseUtils_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function playAttackingAnimation(source, target) {
        return _playAnimation({
            frames: [
                [
                    { unit: source, activity: types_1.Activity.ATTACKING },
                    { unit: target, activity: types_1.Activity.DAMAGED }
                ],
                [
                    { unit: source, activity: types_1.Activity.STANDING },
                    { unit: target, activity: types_1.Activity.STANDING }
                ]
            ],
            delay: 150
        });
    }
    exports.playAttackingAnimation = playAttackingAnimation;
    function _playAnimation(animation) {
        var delay = animation.delay, frames = animation.frames;
        var promises = [];
        var _loop_4 = function (i) {
            var updatePromise = function () {
                var updatePromises = [];
                for (var j = 0; j < frames[i].length; j++) {
                    var _a = frames[i][j], unit = _a.unit, activity = _a.activity;
                    unit.activity = activity;
                    console.log(unit.name + " " + activity + " => update");
                    updatePromises.push(unit.sprite.update());
                }
                return Promise.all(updatePromises);
            };
            promises.push(updatePromise);
            promises.push(function () {
                console.log("render");
                return jwb.renderer.render();
            });
            if (i < (frames.length - 1)) {
                promises.push(function () {
                    console.log("wait");
                    return PromiseUtils_2.wait(delay);
                });
            }
        };
        for (var i = 0; i < frames.length; i++) {
            _loop_4(i);
        }
        return PromiseUtils_2.chainPromises(promises);
    }
});
define("units/UnitUtils", ["require", "exports", "types/types", "sounds/AudioUtils", "sounds/Sounds", "graphics/animations/Animations"], function (require, exports, types_2, AudioUtils_1, Sounds_1, Animations_1) {
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
                    AudioUtils_1.playSound(Sounds_1.default.FOOTSTEP);
                }
                resolve();
            }
            else {
                var targetUnit_1 = map.getUnit({ x: x, y: y });
                if (!!targetUnit_1) {
                    var damage_1 = unit.getDamage();
                    messages.push(unit.name + " (" + unit.level + ") hit " + targetUnit_1.name + " (" + targetUnit_1.level + ") for " + damage_1 + " damage!");
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
            if (!unit.equipment.get(types_2.EquipmentSlot.RANGED_WEAPON)) {
                // change direction and re-render, but don't do anything (don't spend a turn)
                resolve();
                return;
            }
            var map = jwb.state.getMap();
            var x = unit.x, y = unit.y;
            do {
                x += dx;
                y += dy;
            } while (!map.isBlocked({ x: x, y: y }));
            var targetUnit = map.getUnit({ x: x, y: y });
            if (!!targetUnit) {
                var messages = jwb.state.messages;
                var damage = unit.getRangedDamage();
                messages.push(unit.name + " (" + unit.level + ") hit " + targetUnit.name + " (" + targetUnit.level + ") for " + damage + " damage!");
                targetUnit.takeDamage(damage, unit)
                    .then(function () { return resolve(); });
            }
            else {
                resolve();
            }
        }); });
    }
    exports.fireProjectile = fireProjectile;
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
define("units/UnitBehaviors", ["require", "exports", "utils/Pathfinder", "utils/RandomUtils", "units/UnitUtils", "utils/PromiseUtils", "utils/ArrayUtils", "maps/MapUtils", "types/Directions"], function (require, exports, Pathfinder_1, RandomUtils_2, UnitUtils_1, PromiseUtils_3, ArrayUtils_2, MapUtils_2, Directions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function _wanderAndAttack(unit) {
        var playerUnit = jwb.state.playerUnit;
        var map = jwb.state.getMap();
        var tiles = [];
        Directions_1.default.values().forEach(function (_a) {
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
            var _a = RandomUtils_2.randChoice(tiles), x = _a.x, y = _a.y;
            return UnitUtils_1.moveOrAttack(unit, { x: x, y: y });
        }
        return PromiseUtils_3.resolvedPromise();
    }
    function _wander(unit) {
        var map = jwb.state.getMap();
        var tiles = [];
        Directions_1.default.values().forEach(function (_a) {
            var dx = _a.dx, dy = _a.dy;
            var _b = [unit.x + dx, unit.y + dy], x = _b[0], y = _b[1];
            if (map.contains({ x: x, y: y })) {
                if (!map.isBlocked({ x: x, y: y })) {
                    tiles.push({ x: x, y: y });
                }
            }
        });
        if (tiles.length > 0) {
            var _a = RandomUtils_2.randChoice(tiles), x = _a.x, y = _a.y;
            return UnitUtils_1.moveOrAttack(unit, { x: x, y: y });
        }
        return PromiseUtils_3.resolvedPromise();
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
        return PromiseUtils_3.resolvedPromise();
    }
    function _fleeFromPlayerUnit(unit) {
        var playerUnit = jwb.state.playerUnit;
        var map = jwb.state.getMap();
        var tiles = [];
        Directions_1.default.values().forEach(function (_a) {
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
            var orderedTiles = ArrayUtils_2.sortByReversed(tiles, function (coordinates) { return MapUtils_2.manhattanDistance(coordinates, playerUnit); });
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
define("units/UnitAI", ["require", "exports", "units/UnitBehaviors", "maps/MapUtils", "utils/RandomUtils"], function (require, exports, UnitBehaviors_1, MapUtils_3, RandomUtils_3) {
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
                behavior = RandomUtils_3.weightedRandom({
                    'ATTACK_PLAYER': 0.2,
                    'WANDER': 0.5,
                    'FLEE_FROM_PLAYER': 0.3
                }, behaviorMap);
            }
        }
        else if (distanceToPlayer >= 5) {
            behavior = RandomUtils_3.weightedRandom({
                'WANDER': 0.3,
                'ATTACK_PLAYER': 0.1,
                'STAY': 0.6
            }, behaviorMap);
        }
        else {
            behavior = RandomUtils_3.weightedRandom({
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
            behavior = RandomUtils_3.weightedRandom({
                'WANDER': 0.4,
                'STAY': 0.4,
                'ATTACK_PLAYER': 0.2
            }, behaviorMap);
        }
        else {
            behavior = RandomUtils_3.weightedRandom({
                'ATTACK_PLAYER': 0.9,
                'STAY': 0.1
            }, behaviorMap);
        }
        return behavior(unit);
    };
    exports.HUMAN_AGGRESSIVE = HUMAN_AGGRESSIVE;
    var FULL_AGGRO = function (unit) { return UnitBehaviors_1.default.ATTACK_PLAYER(unit); };
    exports.FULL_AGGRO = FULL_AGGRO;
    var HUMAN_DETERMINISTIC = function (unit) {
        var _a = jwb.state, playerUnit = _a.playerUnit, turn = _a.turn;
        var aiParams = unit.unitClass.aiParams;
        if (!aiParams) {
            throw 'HUMAN_DETEERMINISTIC behavior requires aiParams!';
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
            behavior = UnitBehaviors_1.default.STAY;
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
define("items/InventoryMap", ["require", "exports", "types/types"], function (require, exports, types_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var categories = Object.values(types_3.ItemCategory);
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
define("units/Unit", ["require", "exports", "types/types", "sounds/AudioUtils", "sounds/Sounds", "utils/PromiseUtils", "items/InventoryMap", "items/equipment/EquipmentMap"], function (require, exports, types_4, AudioUtils_2, Sounds_2, PromiseUtils_4, InventoryMap_1, EquipmentMap_1) {
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
            this.level = level;
            this.experience = 0;
            this.life = unitClass.startingLife;
            this.maxLife = unitClass.startingLife;
            this.mana = unitClass.startingMana;
            this.maxMana = unitClass.startingMana;
            this.lifeRemainder = 0;
            this._damage = unitClass.startingDamage;
            this.queuedOrder = null;
            this.aiHandler = unitClass.aiHandler;
            this.activity = types_4.Activity.STANDING;
            this.direction = null;
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
                return PromiseUtils_4.resolvedPromise();
            })
                .then(function () { return _this.sprite.update(); });
        };
        Unit.prototype.getDamage = function () {
            var damage = this._damage;
            this.equipment.getEntries()
                .filter(function (_a) {
                var slot = _a[0], item = _a[1];
                return (slot !== types_4.EquipmentSlot.RANGED_WEAPON);
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
                return (slot !== types_4.EquipmentSlot.MELEE_WEAPON);
            })
                .forEach(function (_a) {
                var slot = _a[0], item = _a[1];
                damage += (item.damage || 0);
            });
            return Math.round(damage);
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
            var renderer = jwb.renderer;
            var playerUnit = jwb.state.playerUnit;
            var map = jwb.state.getMap();
            return new Promise(function (resolve) {
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
define("graphics/sprites/UnitSprite", ["require", "exports", "graphics/ImageSupplier", "graphics/sprites/Sprite", "types/Colors", "types/Directions", "graphics/ImageUtils"], function (require, exports, ImageSupplier_1, Sprite_1, Colors_1, Directions_2, ImageUtils_2) {
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
            var direction = this._unit.direction || Directions_2.default.S;
            var key = this._unit.activity + "_" + Directions_2.default.toString(direction);
            return key;
        };
        return UnitSprite;
    }(Sprite_1.default));
    exports.default = UnitSprite;
});
define("graphics/sprites/PlayerSprite", ["require", "exports", "graphics/sprites/UnitSprite"], function (require, exports, UnitSprite_1) {
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
define("graphics/sprites/GolemSprite", ["require", "exports", "graphics/sprites/UnitSprite"], function (require, exports, UnitSprite_2) {
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
define("graphics/sprites/GruntSprite", ["require", "exports", "graphics/sprites/UnitSprite"], function (require, exports, UnitSprite_3) {
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
define("graphics/sprites/SnakeSprite", ["require", "exports", "graphics/sprites/UnitSprite"], function (require, exports, UnitSprite_4) {
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
define("graphics/sprites/SoldierSprite", ["require", "exports", "graphics/sprites/UnitSprite"], function (require, exports, UnitSprite_5) {
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
define("graphics/sprites/SpriteFactory", ["require", "exports", "graphics/ImageSupplier", "graphics/sprites/Sprite", "types/Colors", "graphics/sprites/PlayerSprite", "graphics/sprites/GolemSprite", "graphics/sprites/GruntSprite", "graphics/sprites/SnakeSprite", "graphics/sprites/SoldierSprite"], function (require, exports, ImageSupplier_2, Sprite_2, Colors_2, PlayerSprite_1, GolemSprite_1, GruntSprite_1, SnakeSprite_1, SoldierSprite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DEFAULT_SPRITE_KEY = 'default';
    function _staticSprite(imageLoader, _a) {
        var _b;
        var dx = _a.dx, dy = _a.dy;
        return new Sprite_2.default((_b = {}, _b[DEFAULT_SPRITE_KEY] = imageLoader, _b), DEFAULT_SPRITE_KEY, { dx: dx, dy: dy });
    }
    var StaticSprites = {
        WALL_TOP: function (paletteSwaps) { return _staticSprite(new ImageSupplier_2.default('tile_wall', Colors_2.default.WHITE, paletteSwaps), { dx: 0, dy: 0 }); },
        WALL_HALL: function (paletteSwaps) { return _staticSprite(new ImageSupplier_2.default('tile_wall_hall', Colors_2.default.WHITE, paletteSwaps), { dx: 0, dy: 0 }); },
        FLOOR: function (paletteSwaps) { return _staticSprite(new ImageSupplier_2.default('tile_floor', Colors_2.default.WHITE, paletteSwaps), { dx: 0, dy: 0 }); },
        FLOOR_HALL: function (paletteSwaps) { return _staticSprite(new ImageSupplier_2.default('tile_floor_hall', Colors_2.default.WHITE, paletteSwaps), { dx: 0, dy: 0 }); },
        STAIRS_DOWN: function (paletteSwaps) { return _staticSprite(new ImageSupplier_2.default('stairs_down2', Colors_2.default.WHITE, paletteSwaps), { dx: 0, dy: 0 }); },
        MAP_SWORD: function (paletteSwaps) { return _staticSprite(new ImageSupplier_2.default('sword_icon', Colors_2.default.WHITE, paletteSwaps), { dx: 0, dy: -8 }); },
        MAP_POTION: function (paletteSwaps) { return _staticSprite(new ImageSupplier_2.default('potion_icon', Colors_2.default.WHITE, paletteSwaps), { dx: 0, dy: -8 }); },
        MAP_SCROLL: function (paletteSwaps) { return _staticSprite(new ImageSupplier_2.default('scroll_icon', Colors_2.default.WHITE, paletteSwaps), { dx: 0, dy: 0 }); },
        MAP_BOW: function (paletteSwaps) { return _staticSprite(new ImageSupplier_2.default('bow_icon', Colors_2.default.WHITE, paletteSwaps), { dx: 0, dy: 0 }); }
    };
    var UnitSprites = {
        PLAYER: function (unit, paletteSwaps) { return new PlayerSprite_1.default(unit, paletteSwaps); },
        GOLEM: function (unit, paletteSwaps) { return new GolemSprite_1.default(unit, paletteSwaps); },
        GRUNT: function (unit, paletteSwaps) { return new GruntSprite_1.default(unit, paletteSwaps); },
        SNAKE: function (unit, paletteSwaps) { return new SnakeSprite_1.default(unit, paletteSwaps); },
        SOLDIER: function (unit, paletteSwaps) { return new SoldierSprite_1.default(unit, paletteSwaps); }
    };
    // the following does not work: { ...StaticSprites, ...UnitSprites }
    // :(
    exports.default = {
        WALL_TOP: StaticSprites.WALL_TOP,
        WALL_HALL: StaticSprites.WALL_HALL,
        FLOOR: StaticSprites.FLOOR,
        FLOOR_HALL: StaticSprites.FLOOR_HALL,
        STAIRS_DOWN: StaticSprites.STAIRS_DOWN,
        MAP_SWORD: StaticSprites.MAP_SWORD,
        MAP_POTION: StaticSprites.MAP_POTION,
        MAP_SCROLL: StaticSprites.MAP_SCROLL,
        MAP_BOW: StaticSprites.MAP_BOW,
        PLAYER: UnitSprites.PLAYER,
        GOLEM: UnitSprites.GOLEM,
        GRUNT: UnitSprites.GRUNT,
        SNAKE: UnitSprites.SNAKE,
        SOLDIER: UnitSprites.SOLDIER
    };
});
define("types/Tiles", ["require", "exports", "graphics/sprites/SpriteFactory"], function (require, exports, SpriteFactory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Tiles = {
        FLOOR: {
            name: 'FLOOR',
            char: '.',
            sprite: SpriteFactory_1.default.FLOOR(),
            isBlocking: false
        },
        FLOOR_HALL: {
            name: 'FLOOR_HALL',
            char: '.',
            sprite: SpriteFactory_1.default.FLOOR_HALL(),
            isBlocking: false
        },
        WALL_TOP: {
            name: 'WALL_TOP',
            char: '#',
            sprite: SpriteFactory_1.default.WALL_TOP(),
            isBlocking: true
        },
        WALL_HALL: {
            name: 'WALL_HALL',
            char: '#',
            sprite: SpriteFactory_1.default.WALL_HALL(),
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
            sprite: SpriteFactory_1.default.STAIRS_DOWN(),
            isBlocking: false
        }
    };
    exports.default = Tiles;
});
define("maps/MapInstance", ["require", "exports", "types/Tiles"], function (require, exports, Tiles_1) {
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
define("maps/MapSupplier", ["require", "exports", "maps/MapInstance"], function (require, exports, MapInstance_1) {
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
define("core/GameState", ["require", "exports", "types/types"], function (require, exports, types_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GameState = /** @class */ (function () {
        function GameState(playerUnit, mapSuppliers) {
            this.screen = types_5.GameScreen.GAME;
            this.playerUnit = playerUnit;
            this.mapSuppliers = mapSuppliers;
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
define("graphics/SpriteRenderer", ["require", "exports", "maps/MapUtils", "types/types", "core/actions", "utils/PromiseUtils", "types/Colors"], function (require, exports, MapUtils_4, types_6, actions_1, PromiseUtils_5, Colors_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TILE_WIDTH = 32;
    var TILE_HEIGHT = 24;
    var WIDTH = 20; // in tiles
    var HEIGHT = 15; // in tiles
    var SCREEN_WIDTH = 640;
    var SCREEN_HEIGHT = 360;
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
            this._context.fillStyle = Colors_3.default.BLACK;
            this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
            return PromiseUtils_5.chainPromises([
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
                            promises.push(this._drawEllipse({ x: x, y: y }, Colors_3.default.DARK_GRAY, TILE_WIDTH * 3 / 8, TILE_HEIGHT * 3 / 8));
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
                                promises.push(this._drawEllipse({ x: x, y: y }, Colors_3.default.GREEN, TILE_WIDTH * 3 / 8, TILE_HEIGHT * 3 / 8));
                            }
                            else {
                                promises.push(this._drawEllipse({ x: x, y: y }, Colors_3.default.DARK_GRAY, TILE_WIDTH * 3 / 8, TILE_HEIGHT * 3 / 8));
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
            _context.fillStyle = Colors_3.default.WHITE;
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
                var slot = _a[0], equipment = _a[1];
                _context.fillText(slot + " - " + equipment.name, equipmentLeft, y);
                y += LINE_HEIGHT;
            });
            // draw inventory categories
            var inventoryCategories = Object.values(types_6.ItemCategory);
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
                        _context.fillStyle = Colors_3.default.YELLOW;
                    }
                    else {
                        _context.fillStyle = Colors_3.default.WHITE;
                    }
                    _context.fillText(items[i].name, x, y_1);
                }
                _context.fillStyle = Colors_3.default.WHITE;
            }
            return PromiseUtils_5.resolvedPromise();
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
            return PromiseUtils_5.resolvedPromise();
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
                _context.fillStyle = Colors_3.default.BLACK;
                _context.strokeStyle = Colors_3.default.WHITE;
                var left = SCREEN_WIDTH - BOTTOM_PANEL_WIDTH;
                var top = SCREEN_HEIGHT - BOTTOM_PANEL_HEIGHT;
                _this._drawRect({ left: left, top: top, width: BOTTOM_PANEL_WIDTH, height: BOTTOM_PANEL_HEIGHT });
                _context.fillStyle = Colors_3.default.WHITE;
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
            _context.fillStyle = Colors_3.default.WHITE;
            var textLeft = left + 4;
            _context.fillText("Level: " + ((mapIndex || 0) + 1), textLeft, top + 8);
            _context.fillText("Turn: " + turn, textLeft, top + 8 + LINE_HEIGHT);
            return PromiseUtils_5.resolvedPromise();
        };
        SpriteRenderer.prototype._drawRect = function (_a) {
            var left = _a.left, top = _a.top, width = _a.width, height = _a.height;
            var _context = this._context;
            _context.fillStyle = Colors_3.default.BLACK;
            _context.fillRect(left, top, width, height);
            _context.strokeStyle = Colors_3.default.WHITE;
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
define("items/equipment/EquipmentClasses", ["require", "exports", "types/types", "graphics/sprites/SpriteFactory", "types/Colors"], function (require, exports, types_7, SpriteFactory_2, Colors_4) {
    "use strict";
    var _a, _b, _c, _d;
    Object.defineProperty(exports, "__esModule", { value: true });
    var BRONZE_SWORD = {
        name: 'Bronze Sword',
        char: 'S',
        itemCategory: types_7.ItemCategory.WEAPON,
        equipmentCategory: types_7.EquipmentSlot.MELEE_WEAPON,
        mapIcon: SpriteFactory_2.default.MAP_SWORD,
        paletteSwaps: (_a = {},
            _a[Colors_4.default.BLACK] = Colors_4.default.BLACK,
            _a[Colors_4.default.DARK_GRAY] = Colors_4.default.LIGHT_BROWN,
            _a[Colors_4.default.LIGHT_GRAY] = Colors_4.default.LIGHT_BROWN,
            _a),
        damage: 4,
        minLevel: 1,
        maxLevel: 2
    };
    var IRON_SWORD = {
        name: 'Iron Sword',
        char: 'S',
        itemCategory: types_7.ItemCategory.WEAPON,
        equipmentCategory: types_7.EquipmentSlot.MELEE_WEAPON,
        mapIcon: SpriteFactory_2.default.MAP_SWORD,
        paletteSwaps: (_b = {},
            _b[Colors_4.default.DARK_GRAY] = Colors_4.default.BLACK,
            _b[Colors_4.default.LIGHT_GRAY] = Colors_4.default.DARK_GRAY,
            _b),
        damage: 7,
        minLevel: 3,
        maxLevel: 4
    };
    var STEEL_SWORD = {
        name: 'Steel Sword',
        char: 'S',
        itemCategory: types_7.ItemCategory.WEAPON,
        equipmentCategory: types_7.EquipmentSlot.MELEE_WEAPON,
        mapIcon: SpriteFactory_2.default.MAP_SWORD,
        paletteSwaps: (_c = {},
            _c[Colors_4.default.DARK_GRAY] = Colors_4.default.DARK_GRAY,
            _c[Colors_4.default.LIGHT_GRAY] = Colors_4.default.LIGHT_GRAY,
            _c),
        damage: 10,
        minLevel: 4,
        maxLevel: 6
    };
    var FIRE_SWORD = {
        name: 'Fire Sword',
        char: 'S',
        itemCategory: types_7.ItemCategory.WEAPON,
        equipmentCategory: types_7.EquipmentSlot.MELEE_WEAPON,
        mapIcon: SpriteFactory_2.default.MAP_SWORD,
        paletteSwaps: (_d = {},
            _d[Colors_4.default.DARK_GRAY] = Colors_4.default.YELLOW,
            _d[Colors_4.default.LIGHT_GRAY] = Colors_4.default.RED,
            _d[Colors_4.default.BLACK] = Colors_4.default.DARK_RED,
            _d),
        damage: 14,
        minLevel: 5,
        maxLevel: 6
    };
    var SHORT_BOW = {
        name: 'Short Bow',
        char: 'S',
        itemCategory: types_7.ItemCategory.WEAPON,
        equipmentCategory: types_7.EquipmentSlot.RANGED_WEAPON,
        mapIcon: SpriteFactory_2.default.MAP_BOW,
        paletteSwaps: {},
        damage: 6,
        minLevel: 2,
        maxLevel: 6
    };
    function getWeaponClasses() {
        return [BRONZE_SWORD, IRON_SWORD, STEEL_SWORD, FIRE_SWORD, SHORT_BOW];
    }
    exports.default = {
        BRONZE_SWORD: BRONZE_SWORD,
        IRON_SWORD: IRON_SWORD,
        STEEL_SWORD: STEEL_SWORD,
        getWeaponClasses: getWeaponClasses
    };
});
define("items/ItemFactory", ["require", "exports", "sounds/Sounds", "items/InventoryItem", "types/types", "sounds/AudioUtils", "utils/PromiseUtils", "utils/RandomUtils", "graphics/sprites/SpriteFactory", "items/equipment/EquipmentClasses", "items/MapItem"], function (require, exports, Sounds_3, InventoryItem_1, types_8, AudioUtils_3, PromiseUtils_6, RandomUtils_4, SpriteFactory_3, EquipmentClasses_1, MapItem_1) {
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
        return new InventoryItem_1.default('Potion', types_8.ItemCategory.POTION, onUse);
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
            adjacentUnits.forEach(function (u) {
                promises.push(function () { return u.takeDamage(damage, unit); });
            });
            return PromiseUtils_6.chainPromises(promises);
        };
        return new InventoryItem_1.default('Scroll of Floor Fire', types_8.ItemCategory.SCROLL, onUse);
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
        return RandomUtils_4.randChoice(suppliers)({ x: x, y: y });
    }
    exports.default = {
        createRandomItem: createRandomItem
    };
});
define("maps/DungeonGenerator", ["require", "exports", "utils/Pathfinder", "types/Tiles", "utils/ArrayUtils", "maps/MapUtils", "utils/RandomUtils"], function (require, exports, Pathfinder_2, Tiles_2, ArrayUtils_3, MapUtils_5, RandomUtils_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
            this._minRoomDimension = minRoomDimension;
            this._maxRoomDimension = maxRoomDimension;
            this._minRoomPadding = minRoomPadding;
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
                    tiles: __spreadArrays([_this._emptyRow(width)], section.tiles)
                };
            })();
            this._addWalls(section);
            var tiles = section.tiles;
            var stairsLocation = MapUtils_5.pickUnoccupiedLocations(tiles, [Tiles_2.default.FLOOR], [], 1)[0];
            tiles[stairsLocation.y][stairsLocation.x] = Tiles_2.default.STAIRS_DOWN;
            var enemyUnitLocations = MapUtils_5.pickUnoccupiedLocations(tiles, [Tiles_2.default.FLOOR], [stairsLocation], numEnemies);
            var playerUnitLocation = this._pickPlayerLocation(tiles, __spreadArrays([stairsLocation], enemyUnitLocations))[0];
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
            var minSectionDimension = this._minRoomDimension + (2 * this._minRoomPadding);
            var canSplitHorizontally = (width >= (2 * minSectionDimension));
            var canSplitVertically = (height >= (2 * minSectionDimension));
            var splitDirections = __spreadArrays((canSplitHorizontally ? ['HORIZONTAL'] : []), (canSplitVertically ? ['VERTICAL'] : []));
            if (splitDirections.length > 0) {
                var direction = RandomUtils_5.randChoice(splitDirections);
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
            var maxRoomWidth = width - (2 * this._minRoomPadding);
            var maxRoomHeight = height - (2 * this._minRoomPadding);
            console.assert(maxRoomWidth >= this._minRoomDimension && maxRoomHeight >= this._minRoomDimension, 'calculate room dimensions failed');
            var roomWidth = RandomUtils_5.randInt(this._minRoomDimension, maxRoomWidth);
            var roomHeight = RandomUtils_5.randInt(this._minRoomDimension, maxRoomHeight);
            var roomTiles = this._generateRoomTiles(roomWidth, roomHeight);
            var roomLeft = RandomUtils_5.randInt(this._minRoomPadding, width - roomWidth - this._minRoomPadding);
            var roomTop = RandomUtils_5.randInt(this._minRoomPadding, height - roomHeight - this._minRoomPadding);
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
         */
        DungeonGenerator.prototype._getSplitPoint = function (dimension) {
            var minSectionDimension = this._minRoomDimension + 2 * this._minRoomPadding;
            var minSplitPoint = minSectionDimension;
            var maxSplitPoint = dimension - minSectionDimension;
            return RandomUtils_5.randInt(minSplitPoint, maxSplitPoint);
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
                var candidatePairs = connectedRooms
                    .flatMap(function (connectedRoom) { return unconnectedRooms.map(function (unconnectedRoom) { return [connectedRoom, unconnectedRoom]; }); })
                    .filter(function (_a) {
                    var connectedRoom = _a[0], unconnectedRoom = _a[1];
                    return _this._canJoinRooms(connectedRoom, unconnectedRoom);
                })
                    .sort(ArrayUtils_3.comparing(function (_a) {
                    var first = _a[0], second = _a[1];
                    return _this._roomDistance(first, second);
                }));
                var joinedAnyRooms = false;
                for (var _i = 0, candidatePairs_1 = candidatePairs; _i < candidatePairs_1.length; _i++) {
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
                    this._logSections('fux', section);
                    debugger;
                }
            }
        };
        /**
         * add walls above corridor tiles if possible
         */
        DungeonGenerator.prototype._addWalls = function (section) {
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
            return (first !== second); // && (first.exits.length < MAX_EXITS) && (second.exits.length < MAX_EXITS);
        };
        DungeonGenerator.prototype._joinRooms = function (first, second, section) {
            var firstExitCandidates = this._getExitCandidates(first);
            var secondExitCandidates = this._getExitCandidates(second);
            RandomUtils_5.shuffle(firstExitCandidates);
            RandomUtils_5.shuffle(secondExitCandidates);
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
                return !room.exits.some(function (exit) { return MapUtils_5.isAdjacent(exit, { x: x, y: y }); });
            });
        };
        /**
         * Find a path between the specified exits between rooms.
         */
        DungeonGenerator.prototype._joinExits = function (firstExit, secondExit, section) {
            var blockedTileDetector = function (_a) {
                var x = _a.x, y = _a.y;
                // can't draw a path through an existing room or a wall
                var blockedTileTypes = [Tiles_2.default.FLOOR, Tiles_2.default.WALL, Tiles_2.default.WALL_HALL, Tiles_2.default.WALL_TOP];
                if ([firstExit, secondExit].some(function (exit) { return MapUtils_5.coordinatesEquals({ x: x, y: y }, exit); })) {
                    return false;
                }
                else if (section.tiles[y][x] === Tiles_2.default.NONE || section.tiles[y][x] === Tiles_2.default.FLOOR_HALL) {
                    // skip the check if we're within 1 tile vertically of an exit
                    var isNextToExit = [-2, -1, 1, 2].some(function (dy) { return ([firstExit, secondExit].some(function (exit) { return MapUtils_5.coordinatesEquals(exit, { x: x, y: y + dy }); })); });
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
        /**
         * Spawn the player at the tile that maximizes average distance from enemies and the level exit.
         */
        DungeonGenerator.prototype._pickPlayerLocation = function (tiles, blockedTiles) {
            var candidates = [];
            var _loop_5 = function (y) {
                var _loop_6 = function (x) {
                    if (!tiles[y][x].isBlocking && !blockedTiles.some(function (tile) { return MapUtils_5.coordinatesEquals(tile, { x: x, y: y }); })) {
                        var tileDistances = blockedTiles.map(function (blockedTile) { return MapUtils_5.hypotenuse({ x: x, y: y }, blockedTile); });
                        candidates.push([{ x: x, y: y }, ArrayUtils_3.average(tileDistances)]);
                    }
                };
                for (var x = 0; x < tiles[y].length; x++) {
                    _loop_6(x);
                }
            };
            for (var y = 0; y < tiles.length; y++) {
                _loop_5(y);
            }
            console.assert(candidates.length > 0);
            return candidates.sort(function (a, b) { return (b[1] - a[1]); })[0];
        };
        DungeonGenerator.prototype._emptyRow = function (width) {
            var row = [];
            for (var x = 0; x < width; x++) {
                row.push(Tiles_2.default.NONE);
            }
            return row;
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
define("units/UnitClasses", ["require", "exports", "graphics/sprites/SpriteFactory", "types/Colors", "types/types", "units/UnitAI"], function (require, exports, SpriteFactory_4, Colors_5, types_9, UnitAI_1) {
    "use strict";
    var _a, _b;
    Object.defineProperty(exports, "__esModule", { value: true });
    var PLAYER = {
        name: 'PLAYER',
        type: types_9.UnitType.HUMAN,
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
        startingMana: 100,
        startingDamage: 10,
        minLevel: 1,
        maxLevel: 20,
        lifePerLevel: function (level) { return 10; },
        manaPerLevel: function (level) { return 0; },
        damagePerLevel: function (level) { return 1; },
        experienceToNextLevel: function (currentLevel) { return (currentLevel < 10) ? 2 * currentLevel + 4 : null; },
    };
    var ENEMY_SNAKE = {
        name: 'ENEMY_SNAKE',
        type: types_9.UnitType.ANIMAL,
        sprite: SpriteFactory_4.default.SNAKE,
        paletteSwaps: {},
        startingLife: 60,
        startingMana: null,
        startingDamage: 5,
        minLevel: 1,
        maxLevel: 3,
        lifePerLevel: function () { return 15; },
        manaPerLevel: function () { return null; },
        damagePerLevel: function () { return 2; },
        aiHandler: UnitAI_1.HUMAN_DETERMINISTIC,
        aiParams: {
            speed: 0.95,
            visionRange: 12,
            fleeThreshold: 0.2
        }
    };
    var ENEMY_GRUNT = {
        name: 'ENEMY_GRUNT',
        type: types_9.UnitType.HUMAN,
        sprite: SpriteFactory_4.default.GRUNT,
        paletteSwaps: {},
        startingLife: 90,
        startingMana: null,
        startingDamage: 9,
        minLevel: 1,
        maxLevel: 4,
        lifePerLevel: function () { return 15; },
        manaPerLevel: function () { return null; },
        damagePerLevel: function () { return 2; },
        aiHandler: UnitAI_1.HUMAN_DETERMINISTIC,
        aiParams: {
            speed: 0.6,
            visionRange: 8,
            fleeThreshold: 0.3
        }
    };
    var ENEMY_SOLDIER = {
        name: 'ENEMY_SOLDIER',
        type: types_9.UnitType.HUMAN,
        sprite: SpriteFactory_4.default.SOLDIER,
        paletteSwaps: {},
        startingLife: 120,
        startingMana: null,
        startingDamage: 12,
        minLevel: 3,
        maxLevel: 6,
        lifePerLevel: function () { return 20; },
        manaPerLevel: function () { return null; },
        damagePerLevel: function () { return 4; },
        aiHandler: UnitAI_1.HUMAN_DETERMINISTIC,
        aiParams: {
            speed: 0.9,
            visionRange: 10,
            fleeThreshold: 0.2
        }
    };
    var ENEMY_GOLEM = {
        name: 'ENEMY_GOLEM',
        type: types_9.UnitType.GOLEM,
        sprite: SpriteFactory_4.default.GOLEM,
        paletteSwaps: (_b = {},
            _b[Colors_5.default.DARK_GRAY] = Colors_5.default.DARKER_GRAY,
            _b[Colors_5.default.LIGHT_GRAY] = Colors_5.default.DARKER_GRAY,
            _b),
        startingLife: 150,
        startingMana: null,
        startingDamage: 30,
        minLevel: 5,
        maxLevel: 9,
        lifePerLevel: function () { return 30; },
        manaPerLevel: function () { return null; },
        damagePerLevel: function () { return 5; },
        aiHandler: UnitAI_1.HUMAN_DETERMINISTIC,
        aiParams: {
            speed: 0.6,
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
define("units/UnitFactory", ["require", "exports", "units/UnitClasses", "utils/RandomUtils", "units/Unit"], function (require, exports, UnitClasses_1, RandomUtils_6, Unit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createRandomEnemy(_a, level) {
        var x = _a.x, y = _a.y;
        var candidates = UnitClasses_1.default.getEnemyClasses()
            .filter(function (unitClass) { return level >= unitClass.minLevel; })
            .filter(function (unitClass) { return level <= unitClass.maxLevel; });
        var unitClass = RandomUtils_6.randChoice(candidates);
        return new Unit_1.default(unitClass, unitClass.name, level, { x: x, y: y });
    }
    exports.default = {
        createRandomEnemy: createRandomEnemy
    };
});
define("maps/MapFactory", ["require", "exports", "items/ItemFactory", "maps/DungeonGenerator", "units/UnitFactory"], function (require, exports, ItemFactory_1, DungeonGenerator_1, UnitFactory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // outer dimensions
    var MIN_ROOM_DIMENSION = 6;
    var MAX_ROOM_DIMENSION = 9;
    var MIN_ROOM_PADDING = 1;
    function createRandomMap(level, width, height, numEnemies, numItems) {
        var dungeonGenerator = new DungeonGenerator_1.default(MIN_ROOM_DIMENSION, MAX_ROOM_DIMENSION, MIN_ROOM_PADDING);
        return dungeonGenerator.generateDungeon(level, width, height, numEnemies, UnitFactory_1.default.createRandomEnemy, numItems, ItemFactory_1.default.createRandomItem);
    }
    exports.default = { createRandomMap: createRandomMap };
});
define("sounds/Music", ["require", "exports", "utils/RandomUtils", "sounds/AudioUtils"], function (require, exports, RandomUtils_7, AudioUtils_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function _transpose8va(_a) {
        var freq = _a[0], ms = _a[1];
        return [freq * 2, ms];
    }
    function _transpose8vb(_a) {
        var freq = _a[0], ms = _a[1];
        return [freq / 2, ms];
    }
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
    var SUITE_2 = (function () {
        var FIGURE_1 = [[100, 1000], [80, 1000], [120, 1000], [80, 1000]]
            .map(_transpose8va);
        var FIGURE_2 = [[50, 1000], [80, 1000], [200, 1000], [240, 750], [230, 250]]
            //const FIGURE_2 = [[50,1000],[80,1000],[200,1000],[240,750],[/*230*/225,250]]
            .map(_transpose8va)
            .map(_transpose8va);
        var FIGURE_3 = [[300, 500], [240, 500], [225, 1000], [200, 750], [150, 250], [180, 1000]];
        // const FIGURE_3 = [[300,500],[/*235*/240,500],[225,1000],[200,750],[150,250],[180,1000]];
        var FIGURE_4 = [[50, 250], [80, 250], [100, 500], [80, 250], [100, 250], [225, 125], [200, 125], [180, 125], [150, 125], [50, 250], [80, 250], [100, 500], [80, 250], [100, 250], [225, 125], [200, 125], [180, 125], [150, 125]]
            .map(_transpose8va)
            .map(_transpose8va);
        var FIGURE_5 = [[300, 500], [200, 1000], [225, 500], [240, 500], [150, 1000], [100, 250], [180, 250]];
        //const FIGURE_5 = [[300,500],[200,1000],[225,500],[/*235*/240,500],[150,1000],[100,250],[180,250]];
        var FIGURE_6 = [[100, 250], [0, 250], [100, 250], [0, 250], [100, 250], [0, 250], [100, 250], [120, 250], [100, 250], [0, 250], [100, 250], [0, 250], [80, 250], [100, 250], [80, 250], [90, 250]]
            .map(_transpose8va);
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
            .map(_transpose8va);
        var FIGURE_2 = [[200, 1400], [100, 200], [235, 800], [225, 800], [270, 1600], [300, 800], [270, 400], [235, 200], [225, 200]];
        var FIGURE_3 = [[75, 1600], [80, 1600], [100, 3200]]
            .map(_transpose8va);
        var FIGURE_4 = [[300, 200], [280, 400], [235, 100], [200, 100], [240, 400], [225, 200], [200, 100], [0, 100], [300, 200], [280, 400], [235, 100], [200, 100], [240, 400], [225, 200], [200, 100], [0, 100], [300, 200], [280, 400], [235, 100], [200, 100], [240, 400], [225, 200], [200, 100], [0, 100], [300, 200], [280, 400], [235, 100], [200, 100], [240, 400], [225, 200], [200, 100], [0, 100]];
        var FIGURE_5 = [[200, 800], [225, 400], [235, 400], [200, 200], [150, 200], [100, 400], [180, 800], [160, 600], [100, 200], [150, 200], [160, 200], [100, 400], [120, 200], [150, 200], [180, 400], [230, 800]]
            .map(_transpose8va);
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
    var SUITE_4 = (function () {
        var FIGURE_1 = [[100, 1920], [135, 1920], [100, 1920], [150, 1920]]
            .map(_transpose8va);
        var FIGURE_2 = [[80, 1920], [100, 1920], [120, 1920], [90, 1920]]
            .map(_transpose8va);
        var FIGURE_3 = [[100, 960], [150, 960], [120, 960], [135, 960], [100, 960], [150, 960], [120, 960], [135, 960]]
            .map(_transpose8va);
        var FIGURE_4 = _duplicate([[0, 240], [50, 240], [150, 240], [50, 240], [120, 240], [50, 240], [0, 480], [120, 240], [150, 240], [50, 240], [180, 1200]])
            .map(_transpose8va);
        var FIGURE_5 = [[200, 720], [240, 480], [0, 480], [270, 480], [280, 240], [270, 240], [240, 240], [270, 240], [240, 240], [0, 480], [200, 720], [240, 720], [0, 480], [300, 240], [360, 240], [300, 240], [280, 480], [0, 720]];
        var FIGURE_6 = _duplicate([[100, 200], [0, 40], [100, 240], [0, 240], [100, 240], [0, 960], [100, 200], [0, 40], [100, 200], [0, 40], [120, 480], [100, 200], [0, 40], [100, 200], [0, 40], [90, 480]])
            .map(_transpose8va);
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
    function playSuite(suite) {
        var sections = Object.values(suite.sections);
        var numRepeats = 4;
        var _loop_7 = function (i) {
            var section = sections[i];
            var bass = (!!section.bass) ? RandomUtils_7.randChoice(section.bass) : null;
            var lead;
            if (!!section.lead) {
                do {
                    lead = RandomUtils_7.randChoice(section.lead);
                } while (lead === bass);
            }
            for (var j = 0; j < numRepeats; j++) {
                setTimeout(function () {
                    var figures = __spreadArrays((!!bass ? [bass.map(_transpose8vb)] : []), (!!lead ? [lead] : []));
                    figures.forEach(function (figure) { return AudioUtils_4.playMusic(figure); });
                }, ((numRepeats * i) + j) * suite.length);
            }
        };
        for (var i = 0; i < sections.length; i++) {
            _loop_7(i);
        }
        setTimeout(function () { return playSuite(suite); }, sections.length * suite.length * numRepeats);
    }
    exports.default = {
        SUITE_1: SUITE_1,
        SUITE_2: SUITE_2,
        SUITE_3: SUITE_3,
        SUITE_4: SUITE_4,
        playSuite: playSuite
    };
});
define("core/actions", ["require", "exports", "core/GameState", "units/Unit", "graphics/SpriteRenderer", "maps/MapFactory", "units/UnitClasses", "sounds/Music", "maps/MapUtils", "maps/MapSupplier", "core/InputHandler", "utils/RandomUtils"], function (require, exports, GameState_1, Unit_2, SpriteRenderer_1, MapFactory_1, UnitClasses_2, Music_1, MapUtils_6, MapSupplier_1, InputHandler_1, RandomUtils_8) {
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
        var playerUnit = new Unit_2.default(UnitClasses_2.default.PLAYER, 'player', 1, { x: 0, y: 0 });
        jwb.state = new GameState_1.default(playerUnit, [
            MapFactory_1.default.createRandomMap(1, 30, 22, 7, 4),
            MapFactory_1.default.createRandomMap(2, 32, 23, 8, 4),
            MapFactory_1.default.createRandomMap(3, 34, 24, 9, 3),
            MapFactory_1.default.createRandomMap(4, 36, 25, 10, 3),
            MapFactory_1.default.createRandomMap(5, 38, 26, 11, 3),
            MapFactory_1.default.createRandomMap(6, 30, 27, 12, 3)
        ]);
        jwb.renderer = new SpriteRenderer_1.default();
        loadMap(0);
        InputHandler_1.attachEvents();
        jwb.renderer.render();
        Music_1.default.playSuite(RandomUtils_8.randChoice([Music_1.default.SUITE_1, Music_1.default.SUITE_2, Music_1.default.SUITE_3]));
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
define("core/TurnHandler", ["require", "exports", "utils/PromiseUtils"], function (require, exports, PromiseUtils_7) {
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
        return PromiseUtils_7.chainPromises(unitPromises)
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
define("items/ItemUtils", ["require", "exports", "sounds/AudioUtils", "sounds/Sounds"], function (require, exports, AudioUtils_5, Sounds_4) {
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
define("core/InputHandler", ["require", "exports", "core/actions", "types/types", "core/TurnHandler", "types/Tiles", "sounds/Sounds", "items/ItemUtils", "utils/PromiseUtils", "units/UnitUtils", "sounds/AudioUtils"], function (require, exports, actions_2, types_10, TurnHandler_1, Tiles_3, Sounds_5, ItemUtils_1, PromiseUtils_8, UnitUtils_2, AudioUtils_6) {
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
        return PromiseUtils_8.resolvedPromise();
    }
    exports.simulateKeyPress = keyHandler;
    function _handleArrowKey(command) {
        var _a, _b, _c, _d;
        var state = jwb.state;
        switch (state.screen) {
            case types_10.GameScreen.GAME:
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
            case types_10.GameScreen.INVENTORY:
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
            default:
                throw "Invalid game screen " + state.screen;
        }
    }
    function _handleEnter() {
        var state = jwb.state;
        var playerUnit = state.playerUnit;
        switch (state.screen) {
            case types_10.GameScreen.GAME: {
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
                else if (map.getTile({ x: x, y: y }) === Tiles_3.default.STAIRS_DOWN) {
                    AudioUtils_6.playSound(Sounds_5.default.DESCEND_STAIRS);
                    actions_2.loadMap(mapIndex + 1);
                }
                return TurnHandler_1.default.playTurn(null);
            }
            case types_10.GameScreen.INVENTORY: {
                var playerUnit_1 = state.playerUnit;
                var selectedItem = playerUnit_1.inventory.selectedItem;
                if (!!selectedItem) {
                    state.screen = types_10.GameScreen.GAME;
                    return ItemUtils_1.useItem(playerUnit_1, selectedItem)
                        .then(function () { return jwb.renderer.render(); });
                }
                return PromiseUtils_8.resolvedPromise();
            }
            default:
                throw "Unknown game screen: " + state.screen;
        }
    }
    function _handleTab() {
        var state = jwb.state, renderer = jwb.renderer;
        switch (state.screen) {
            case types_10.GameScreen.INVENTORY:
                state.screen = types_10.GameScreen.GAME;
                break;
            default:
                state.screen = types_10.GameScreen.INVENTORY;
                break;
        }
        return renderer.render();
    }
    function attachEvents() {
        window.onkeydown = keyHandlerWrapper;
    }
    exports.attachEvents = attachEvents;
});
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
define("core/globals", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("core/main", ["require", "exports", "core/actions"], function (require, exports, actions_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // @ts-ignore
    window.jwb = window.jwb || {};
    window.onload = function () { return actions_3.restartGame(); };
});
define("graphics/AsciiRenderer", ["require", "exports", "utils/PromiseUtils", "units/Unit", "types/types"], function (require, exports, PromiseUtils_9, Unit_3, types_11) {
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
                case types_11.GameScreen.GAME:
                    return this._renderGameScreen();
                case types_11.GameScreen.INVENTORY:
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
            return PromiseUtils_9.resolvedPromise();
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
            return PromiseUtils_9.resolvedPromise();
        };
        AsciiRenderer.prototype._renderElement = function (element) {
            if (element instanceof Unit_3.default) {
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
define("graphics/sprites/SpriteClasses", ["require", "exports", "graphics/ImageSupplier", "types/Colors", "graphics/ImageUtils"], function (require, exports, ImageSupplier_3, Colors_6, ImageUtils_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SpriteClasses = {
        PLAYER: {
            name: 'PLAYER',
            imageMap: {
                STANDING: function (paletteSwaps) { return new ImageSupplier_3.default('player_standing_SE_1', Colors_6.default.WHITE, paletteSwaps); },
                STANDING_DAMAGED: function (paletteSwaps) { return new ImageSupplier_3.default('player_standing_SE_1', Colors_6.default.WHITE, paletteSwaps, [function (img) { return ImageUtils_3.replaceAll(img, Colors_6.default.WHITE); }]); }
            }
        }
    };
});
define("maps/AsciiMaps", ["require", "exports", "units/UnitClasses", "units/Unit", "types/Tiles"], function (require, exports, UnitClasses_3, Unit_4, Tiles_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FIXED_MAPS = [
        function () { return _mapFromAscii("\n              ###########\n              #.........#\n              #....U....#               \n              #.....................\n              #.........#          .\n              ###.#######          .\n                 .                 .\n#############      .                 .\n#...........#      .           ######.#####\n#...........#      .           #..........#\n#....@......#      .           #...U....>.#\n#...................           #..........#\n#...........#                  #.....U....#\n#......U....#                  ############\n#############\n", 1); },
        function () { return _mapFromAscii("\n###########################################\n#.........................................#\n#...............U............U............#\n#.........................................#\n#...........####################......U...#\n#...........#                  #..........#\n#...@.......#                  #..........#\n#...........#                  #..........#\n#...........#                  ############\n#############\n", 2); }
    ];
    function _mapFromAscii(ascii, level) {
        var lines = ascii.split('\n').filter(function (line) { return !line.match(/^ *$/); });
        var tiles = [];
        var playerUnitLocation = null;
        var enemyUnitLocations = [];
        for (var y = 0; y < lines.length; y++) {
            var line = lines[y];
            var _loop_8 = function (x) {
                var c = line[x];
                var tile = Object.values(Tiles_4.default).filter(function (t) { return t.char === c; })[0] || null;
                if (!tile) {
                    if (c === '@') {
                        playerUnitLocation = { x: x, y: y };
                        tile = Tiles_4.default.FLOOR;
                    }
                    else if (c === 'U') {
                        enemyUnitLocations.push({ x: x, y: y });
                        tile = Tiles_4.default.FLOOR;
                    }
                    else {
                        tile = Tiles_4.default.NONE;
                    }
                }
                tiles[y] = tiles[y] || [];
                tiles[y][x] = tile;
            };
            for (var x = 0; x < line.length; x++) {
                _loop_8(x);
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
                return new Unit_4.default(UnitClasses_3.default.ENEMY_GRUNT, 'enemy_grunt', level, { x: x, y: y });
            },
            itemLocations: [],
            itemSupplier: function () {
                throw 'unsupported';
            }
        };
    }
    exports.default = FIXED_MAPS;
});
//# sourceMappingURL=roguelike.js.map