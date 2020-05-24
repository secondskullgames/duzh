"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TurnHandler_1 = require("./TurnHandler");
var Sounds_1 = require("../sounds/Sounds");
var ItemUtils_1 = require("../items/ItemUtils");
var PromiseUtils_1 = require("../utils/PromiseUtils");
var UnitUtils_1 = require("../units/UnitUtils");
var SoundFX_1 = require("../sounds/SoundFX");
var actions_1 = require("./actions");
var types_1 = require("../types/types");
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
    KeyCommand["M"] = "M";
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
        case 'm':
        case 'M':
            return KeyCommand.M;
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
        case KeyCommand.M:
            return _handleMap();
        default:
    }
    return PromiseUtils_1.resolvedPromise();
}
exports.simulateKeyPress = keyHandler;
function _handleArrowKey(command) {
    var _a, _b, _c, _d;
    var state = jwb.state;
    switch (state.screen) {
        case types_1.GameScreen.GAME:
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
                        return function (u) { return UnitUtils_1.fireProjectile(u, { dx: dx_1, dy: dy_1 }); };
                    default:
                        return function (u) { return UnitUtils_1.moveOrAttack(u, { x: u.x + dx_1, y: u.y + dy_1 }); };
                }
            })();
            return TurnHandler_1.default.playTurn(queuedOrder);
        case types_1.GameScreen.INVENTORY:
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
        case types_1.GameScreen.TITLE:
        case types_1.GameScreen.VICTORY:
        case types_1.GameScreen.GAME_OVER:
        case types_1.GameScreen.MINIMAP:
            return PromiseUtils_1.resolvedPromise();
        default:
            throw "Invalid game screen " + state.screen;
    }
}
function _handleEnter() {
    var state = jwb.state;
    var playerUnit = state.playerUnit;
    switch (state.screen) {
        case types_1.GameScreen.GAME: {
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
            else if (map.getTile({ x: x, y: y }).type === types_1.TileType.STAIRS_DOWN) {
                SoundFX_1.playSound(Sounds_1.default.DESCEND_STAIRS);
                actions_1.loadMap(mapIndex + 1);
            }
            return TurnHandler_1.default.playTurn(null);
        }
        case types_1.GameScreen.INVENTORY: {
            var playerUnit_1 = state.playerUnit;
            var selectedItem = playerUnit_1.inventory.selectedItem;
            if (!!selectedItem) {
                state.screen = types_1.GameScreen.GAME;
                return ItemUtils_1.useItem(playerUnit_1, selectedItem)
                    .then(function () { return jwb.renderer.render(); });
            }
            return PromiseUtils_1.resolvedPromise();
        }
        case types_1.GameScreen.TITLE:
            state.screen = types_1.GameScreen.GAME;
            return actions_1.startGame();
        case types_1.GameScreen.VICTORY:
        case types_1.GameScreen.GAME_OVER:
            state.screen = types_1.GameScreen.GAME;
            return actions_1.restartGame();
        default:
            throw "Unknown game screen: " + state.screen;
    }
}
function _handleTab() {
    var state = jwb.state, renderer = jwb.renderer;
    switch (state.screen) {
        case types_1.GameScreen.INVENTORY:
            state.screen = types_1.GameScreen.GAME;
            break;
        default:
            state.screen = types_1.GameScreen.INVENTORY;
            break;
    }
    return renderer.render();
}
function _handleMap() {
    var state = jwb.state, renderer = jwb.renderer;
    switch (state.screen) {
        case types_1.GameScreen.MINIMAP:
            state.screen = types_1.GameScreen.GAME;
            break;
        default:
            state.screen = types_1.GameScreen.MINIMAP;
            break;
    }
    return renderer.render();
}
function attachEvents() {
    window.onkeydown = keyHandlerWrapper;
}
exports.attachEvents = attachEvents;
//# sourceMappingURL=InputHandler.js.map