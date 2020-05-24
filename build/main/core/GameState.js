"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("../types/types");
/**
 * Global mutable state
 */
var GameState = /** @class */ (function () {
    function GameState(playerUnit, maps) {
        this.screen = types_1.GameScreen.TITLE;
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
//# sourceMappingURL=GameState.js.map