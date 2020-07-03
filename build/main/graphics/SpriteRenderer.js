"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Colors_1 = require("../types/Colors");
var PromiseUtils_1 = require("../utils/PromiseUtils");
var MapUtils_1 = require("../maps/MapUtils");
var types_1 = require("../types/types");
var actions_1 = require("../core/actions");
var ImageUtils_1 = require("./ImageUtils");
var FontRenderer_1 = require("./FontRenderer");
var MinimapRenderer_1 = require("./MinimapRenderer");
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
var INVENTORY_MARGIN = 12;
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
            case types_1.GameScreen.TITLE:
                return this._renderSplashScreen(TITLE_FILENAME, 'PRESS ENTER TO BEGIN');
            case types_1.GameScreen.GAME:
                return this._renderGameScreen();
            case types_1.GameScreen.INVENTORY:
                return this._renderGameScreen()
                    .then(function () { return _this._renderInventory(); });
            case types_1.GameScreen.VICTORY:
                return this._renderSplashScreen(VICTORY_FILENAME, 'PRESS ENTER TO PLAY AGAIN');
            case types_1.GameScreen.GAME_OVER:
                return this._renderSplashScreen(GAME_OVER_FILENAME, 'PRESS ENTER TO PLAY AGAIN');
            case types_1.GameScreen.MINIMAP:
                return this._renderMinimap();
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
        this._bufferContext.fillStyle = Colors_1.default.BLACK;
        this._bufferContext.fillRect(0, 0, this._bufferCanvas.width, this._bufferCanvas.height);
        return PromiseUtils_1.chainPromises([
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
                if (MapUtils_1.isTileRevealed({ x: x, y: y })) {
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
        var _loop_1 = function (y) {
            var _loop_2 = function (x) {
                if (MapUtils_1.isTileRevealed({ x: x, y: y })) {
                    var item_1 = map.getItem({ x: x, y: y });
                    if (!!item_1) {
                        promises.push(this_1._drawEllipse({ x: x, y: y }, Colors_1.default.DARK_GRAY)
                            .then(function () { return _this._renderElement(item_1, { x: x, y: y }); }));
                    }
                }
            };
            for (var x = 0; x < map.width; x++) {
                _loop_2(x);
            }
        };
        var this_1 = this;
        for (var y = 0; y < map.height; y++) {
            _loop_1(y);
        }
        return Promise.all(promises);
    };
    SpriteRenderer.prototype._renderProjectiles = function () {
        var map = jwb.state.getMap();
        var promises = [];
        var _loop_3 = function (y) {
            var _loop_4 = function (x) {
                if (MapUtils_1.isTileRevealed({ x: x, y: y })) {
                    var projectile = map.projectiles
                        .filter(function (p) { return MapUtils_1.coordinatesEquals(p, { x: x, y: y }); })[0];
                    if (!!projectile) {
                        promises.push(this_2._renderElement(projectile, { x: x, y: y }));
                    }
                }
            };
            for (var x = 0; x < map.width; x++) {
                _loop_4(x);
            }
        };
        var this_2 = this;
        for (var y = 0; y < map.height; y++) {
            _loop_3(y);
        }
        return Promise.all(promises);
    };
    SpriteRenderer.prototype._renderUnits = function () {
        var _this = this;
        var playerUnit = jwb.state.playerUnit;
        var map = jwb.state.getMap();
        var promises = [];
        var _loop_5 = function (y) {
            var _loop_6 = function (x) {
                if (MapUtils_1.isTileRevealed({ x: x, y: y })) {
                    var unit_1 = map.getUnit({ x: x, y: y });
                    if (!!unit_1) {
                        var shadowColor = void 0;
                        if (unit_1 === playerUnit) {
                            shadowColor = Colors_1.default.GREEN;
                        }
                        else {
                            shadowColor = Colors_1.default.DARK_GRAY;
                        }
                        promises.push(this_3._drawEllipse({ x: x, y: y }, shadowColor)
                            .then(function () { return _this._renderElement(unit_1, { x: x, y: y }); }));
                    }
                }
            };
            for (var x = 0; x < map.width; x++) {
                _loop_6(x);
            }
        };
        var this_3 = this;
        for (var y = 0; y < map.height; y++) {
            _loop_5(y);
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
        return ImageUtils_1.loadImage(SHADOW_FILENAME)
            .then(function (imageData) { return ImageUtils_1.applyTransparentColor(imageData, Colors_1.default.WHITE); })
            .then(function (imageData) {
            var _a;
            return ImageUtils_1.replaceColors(imageData, (_a = {}, _a[Colors_1.default.BLACK] = color, _a));
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
        return ImageUtils_1.loadImage(INVENTORY_BACKGROUND_FILENAME)
            .then(createImageBitmap)
            .then(function (imageBitmap) { return _this._bufferContext.drawImage(imageBitmap, INVENTORY_LEFT, INVENTORY_TOP, INVENTORY_WIDTH, INVENTORY_HEIGHT); })
            .then(function () {
            // draw equipment
            var equipmentLeft = INVENTORY_LEFT + INVENTORY_MARGIN;
            var itemsLeft = (_bufferCanvas.width + INVENTORY_MARGIN) / 2;
            var promises = [];
            promises.push(_this._drawText('EQUIPMENT', FontRenderer_1.Fonts.PERFECT_DOS_VGA, { x: _bufferCanvas.width / 4, y: INVENTORY_TOP + INVENTORY_MARGIN }, Colors_1.default.WHITE, 'center'));
            promises.push(_this._drawText('INVENTORY', FontRenderer_1.Fonts.PERFECT_DOS_VGA, { x: _bufferCanvas.width * 3 / 4, y: INVENTORY_TOP + INVENTORY_MARGIN }, Colors_1.default.WHITE, 'center'));
            // draw equipment items
            // for now, just display them all in one list
            var y = INVENTORY_TOP + 64;
            playerUnit.equipment.getEntries().forEach(function (_a) {
                var slot = _a[0], equipment = _a[1];
                promises.push(_this._drawText(slot + " - " + equipment.name, FontRenderer_1.Fonts.PERFECT_DOS_VGA, { x: equipmentLeft, y: y }, Colors_1.default.WHITE, 'left'));
                y += LINE_HEIGHT;
            });
            // draw inventory categories
            var inventoryCategories = Object.values(types_1.ItemCategory);
            var categoryWidth = 60;
            var xOffset = 4;
            for (var i = 0; i < inventoryCategories.length; i++) {
                var x = itemsLeft + i * categoryWidth + (categoryWidth / 2) + xOffset;
                var top_1 = INVENTORY_TOP + 40;
                promises.push(_this._drawText(inventoryCategories[i], FontRenderer_1.Fonts.PERFECT_DOS_VGA, { x: x, y: top_1 }, Colors_1.default.WHITE, 'center'));
                if (inventoryCategories[i] === inventory.selectedCategory) {
                    _bufferContext.fillStyle = Colors_1.default.WHITE;
                    _bufferContext.fillRect(x - (categoryWidth / 2) + 4, INVENTORY_TOP + 54, categoryWidth - 8, 1);
                }
            }
            // draw inventory items
            if (inventory.selectedCategory) {
                var items = inventory.get(inventory.selectedCategory);
                var x = itemsLeft + 8;
                for (var i = 0; i < items.length; i++) {
                    var y_1 = INVENTORY_TOP + 64 + LINE_HEIGHT * i;
                    var color = void 0;
                    if (items[i] === inventory.selectedItem) {
                        color = Colors_1.default.YELLOW;
                    }
                    else {
                        color = Colors_1.default.WHITE;
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
        return PromiseUtils_1.resolvedPromise();
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
        return ImageUtils_1.loadImage(HUD_FILENAME)
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
            promises.push(this._drawText(lines[i], FontRenderer_1.Fonts.PERFECT_DOS_VGA, { x: left, y: y }, Colors_1.default.WHITE, 'left'));
        }
        return Promise.all(promises);
    };
    SpriteRenderer.prototype._renderHUDMiddlePanel = function () {
        var _bufferContext = this._bufferContext;
        var messages = jwb.state.messages;
        _bufferContext.fillStyle = Colors_1.default.BLACK;
        _bufferContext.strokeStyle = Colors_1.default.WHITE;
        var left = HUD_LEFT_WIDTH + HUD_MARGIN;
        var top = SCREEN_HEIGHT - HUD_HEIGHT + HUD_MARGIN;
        var promises = [];
        for (var i = 0; i < messages.length; i++) {
            var y = top + (LINE_HEIGHT * i);
            promises.push(this._drawText(messages[i], FontRenderer_1.Fonts.PERFECT_DOS_VGA, { x: left, y: y }, Colors_1.default.WHITE, 'left'));
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
            promises.push(this._drawText(lines[i], FontRenderer_1.Fonts.PERFECT_DOS_VGA, { x: left, y: y }, Colors_1.default.WHITE, 'left'));
        }
        return Promise.all(promises);
    };
    SpriteRenderer.prototype._drawRect = function (_a) {
        var left = _a.left, top = _a.top, width = _a.width, height = _a.height;
        var _bufferContext = this._bufferContext;
        _bufferContext.fillStyle = Colors_1.default.BLACK;
        _bufferContext.fillRect(left, top, width, height);
        _bufferContext.strokeStyle = Colors_1.default.WHITE;
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
        return ImageUtils_1.loadImage(filename)
            .then(function (imageData) { return createImageBitmap(imageData); })
            .then(function (image) { return _this._bufferContext.drawImage(image, 0, 0, _this._bufferCanvas.width, _this._bufferCanvas.height); })
            .then(function () { return _this._drawText(text, FontRenderer_1.Fonts.PERFECT_DOS_VGA, { x: 320, y: 300 }, Colors_1.default.WHITE, 'center'); });
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
            return PromiseUtils_1.resolvedPromise();
        });
    };
    SpriteRenderer.prototype._renderMinimap = function () {
        var _this = this;
        var minimapRenderer = new MinimapRenderer_1.default();
        return minimapRenderer.render()
            .then(function (bitmap) { return _this._bufferContext.drawImage(bitmap, 0, 0); });
    };
    SpriteRenderer.SCREEN_WIDTH = SCREEN_WIDTH;
    SpriteRenderer.SCREEN_HEIGHT = SCREEN_HEIGHT;
    return SpriteRenderer;
}());
exports.default = SpriteRenderer;
//# sourceMappingURL=SpriteRenderer.js.map