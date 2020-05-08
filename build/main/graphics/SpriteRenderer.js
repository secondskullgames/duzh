import Colors from '../types/Colors.js';
import { chainPromises, resolvedPromise } from '../utils/PromiseUtils.js';
import { coordinatesEquals, isTileRevealed } from '../maps/MapUtils.js';
import { GameScreen, ItemCategory } from '../types/types.js';
import { revealTiles } from '../core/actions.js';
import { loadImage } from './ImageUtils.js';
// @ts-ignore
import { initFont } from '../../../node_modules/tinyfont/src/index.js';
// Load the desired font
// @ts-ignore
import { font } from '../../../node_modules/tinyfont/src/fonts/pixel.js';
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
var INVENTORY_HEIGHT = 11 * TILE_HEIGHT;
var LINE_HEIGHT = 16;
var SANS_SERIF = 'sans-serif';
var MONOSPACE = 'Monospace';
var GAME_OVER_FILENAME = 'gameover';
var TITLE_FILENAME = 'title';
var VICTORY_FILENAME = 'victory';
var FONT_SMALL = "10px " + SANS_SERIF;
var FONT_MEDIUM = "14px " + MONOSPACE;
var FONT_LARGE = "20px " + MONOSPACE;
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
        console.log(font);
        this._renderText = initFont(font, this._context);
    }
    SpriteRenderer.prototype.render = function () {
        var _this = this;
        var screen = jwb.state.screen;
        switch (screen) {
            case GameScreen.TITLE:
                //return this._renderSplashScreen(TITLE_FILENAME, 'PRESS ENTER TO BEGIN');
                this._renderText('HELLO world', 100, 100, 24, 'red');
                return resolvedPromise();
            case GameScreen.GAME:
                return this._renderGameScreen();
            case GameScreen.INVENTORY:
                return this._renderGameScreen()
                    .then(function () { return _this._renderInventory(); });
            case GameScreen.VICTORY:
                return this._renderSplashScreen(VICTORY_FILENAME, 'PRESS ENTER TO PLAY AGAIN');
            case GameScreen.GAME_OVER:
                return this._renderSplashScreen(GAME_OVER_FILENAME, 'PRESS ENTER TO PLAY AGAIN');
            default:
                throw "Invalid screen " + screen;
        }
    };
    SpriteRenderer.prototype._renderGameScreen = function () {
        var _this = this;
        revealTiles();
        this._context.fillStyle = Colors.BLACK;
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
        return chainPromises([
            function () { return _this._renderTiles(); },
            function () { return _this._renderItems(); },
            function () { return _this._renderProjectiles(); },
            function () { return _this._renderUnits(); },
            function () { return Promise.all([_this._renderPlayerInfo(), _this._renderBottomBar(), _this._renderMessages()]); },
            function () { _this._renderText('hello world', 100, 100, 24, 'red'); return resolvedPromise(); }
        ]);
    };
    SpriteRenderer.prototype._renderTiles = function () {
        var promises = [];
        var map = jwb.state.getMap();
        for (var y = 0; y < map.height; y++) {
            for (var x = 0; x < map.width; x++) {
                if (isTileRevealed({ x: x, y: y })) {
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
                if (isTileRevealed({ x: x, y: y })) {
                    var item = map.getItem({ x: x, y: y });
                    if (!!item) {
                        promises.push(this._drawEllipse({ x: x, y: y }, Colors.DARK_GRAY, TILE_WIDTH * 3 / 8, TILE_HEIGHT * 3 / 8));
                        promises.push(this._renderElement(item, { x: x, y: y }));
                    }
                }
            }
        }
        return Promise.all(promises);
    };
    SpriteRenderer.prototype._renderProjectiles = function () {
        var map = jwb.state.getMap();
        var promises = [];
        var _loop_1 = function (y) {
            var _loop_2 = function (x) {
                if (isTileRevealed({ x: x, y: y })) {
                    var projectile = map.projectiles
                        .filter(function (p) { return coordinatesEquals(p, { x: x, y: y }); })[0];
                    if (!!projectile) {
                        promises.push(this_1._renderElement(projectile, { x: x, y: y }));
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
    SpriteRenderer.prototype._renderUnits = function () {
        var playerUnit = jwb.state.playerUnit;
        var map = jwb.state.getMap();
        var promises = [];
        for (var y = 0; y < map.height; y++) {
            for (var x = 0; x < map.width; x++) {
                if (isTileRevealed({ x: x, y: y })) {
                    var unit = map.getUnit({ x: x, y: y });
                    if (!!unit) {
                        if (unit === playerUnit) {
                            promises.push(this._drawEllipse({ x: x, y: y }, Colors.GREEN, TILE_WIDTH * 3 / 8, TILE_HEIGHT * 3 / 8));
                        }
                        else {
                            promises.push(this._drawEllipse({ x: x, y: y }, Colors.DARK_GRAY, TILE_WIDTH * 3 / 8, TILE_HEIGHT * 3 / 8));
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
        return new Promise(function (resolve) {
            resolve();
        });
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
        _context.fillStyle = Colors.WHITE;
        _context.textAlign = 'center';
        _context.font = FONT_LARGE;
        _context.fillText('EQUIPMENT', _canvas.width / 4, INVENTORY_TOP + 12);
        _context.fillText('INVENTORY', _canvas.width * 3 / 4, INVENTORY_TOP + 12);
        // draw equipment items
        // for now, just display them all in one list
        _context.font = FONT_SMALL;
        _context.textAlign = 'left';
        var y = INVENTORY_TOP + 64;
        playerUnit.equipment.getEntries().forEach(function (_a) {
            var slot = _a[0], equipment = _a[1];
            _context.fillText(slot + " - " + equipment.name, equipmentLeft, y);
            y += LINE_HEIGHT;
        });
        // draw inventory categories
        var inventoryCategories = Object.values(ItemCategory);
        var categoryWidth = 60;
        var xOffset = 4;
        _context.font = FONT_MEDIUM;
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
            _context.font = FONT_SMALL;
            _context.textAlign = 'left';
            for (var i = 0; i < items.length; i++) {
                var y_1 = INVENTORY_TOP + 64 + LINE_HEIGHT * i;
                if (items[i] === inventory.selectedItem) {
                    _context.fillStyle = Colors.YELLOW;
                }
                else {
                    _context.fillStyle = Colors.WHITE;
                }
                _context.fillText(items[i].name, x, y_1);
            }
            _context.fillStyle = Colors.WHITE;
        }
        return resolvedPromise();
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
        return resolvedPromise();
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
        return new Promise(function (resolve) {
            var top = SCREEN_HEIGHT - BOTTOM_PANEL_HEIGHT;
            _this._drawRect({ left: 0, top: top, width: BOTTOM_PANEL_WIDTH, height: BOTTOM_PANEL_HEIGHT });
            var playerUnit = jwb.state.playerUnit;
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
            var _context = _this._context;
            _context.fillStyle = Colors.WHITE;
            _context.textAlign = 'left';
            _context.font = FONT_SMALL;
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
        return new Promise(function (resolve) {
            var _context = _this._context;
            _context.fillStyle = Colors.BLACK;
            _context.strokeStyle = Colors.WHITE;
            var left = SCREEN_WIDTH - BOTTOM_PANEL_WIDTH;
            var top = SCREEN_HEIGHT - BOTTOM_PANEL_HEIGHT;
            _this._drawRect({ left: left, top: top, width: BOTTOM_PANEL_WIDTH, height: BOTTOM_PANEL_HEIGHT });
            _context.fillStyle = Colors.WHITE;
            _context.textAlign = 'left';
            _context.font = FONT_SMALL;
            var textLeft = left + 4;
            var messages = jwb.state.messages;
            for (var i = 0; i < messages.length; i++) {
                var y = top + (LINE_HEIGHT / 2) + (LINE_HEIGHT * i);
                _context.fillText(messages[i], textLeft, y);
            }
            resolve();
        });
    };
    SpriteRenderer.prototype._renderBottomBar = function () {
        var _context = this._context;
        var _a = jwb.state, mapIndex = _a.mapIndex, turn = _a.turn;
        var left = BOTTOM_PANEL_WIDTH;
        var top = SCREEN_HEIGHT - BOTTOM_BAR_HEIGHT;
        var width = SCREEN_WIDTH - 2 * BOTTOM_PANEL_WIDTH;
        this._drawRect({ left: left, top: top, width: width, height: BOTTOM_BAR_HEIGHT });
        _context.textAlign = 'left';
        _context.fillStyle = Colors.WHITE;
        var textLeft = left + 4;
        _context.fillText("Level: " + ((mapIndex || 0) + 1), textLeft, top + 8);
        _context.fillText("Turn: " + turn, textLeft, top + 8 + LINE_HEIGHT);
        return resolvedPromise();
    };
    SpriteRenderer.prototype._drawRect = function (_a) {
        var left = _a.left, top = _a.top, width = _a.width, height = _a.height;
        var _context = this._context;
        _context.fillStyle = Colors.BLACK;
        _context.fillRect(left, top, width, height);
        _context.strokeStyle = Colors.WHITE;
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
    SpriteRenderer.prototype._renderSplashScreen = function (filename, text) {
        var _this = this;
        return loadImage(filename)
            .then(function (imageData) { return createImageBitmap(imageData); })
            .then(function (image) { return _this._context.drawImage(image, 0, 0, _this._canvas.width, _this._canvas.height); })
            .then(function () {
            var _context = _this._context;
            _context.textAlign = 'center';
            _context.font = FONT_LARGE;
            _context.fillStyle = Colors.WHITE;
            _context.fillText(text, SCREEN_WIDTH / 2, 300);
        });
    };
    return SpriteRenderer;
}());
export default SpriteRenderer;
//# sourceMappingURL=SpriteRenderer.js.map