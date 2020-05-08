import { GameScreen } from '../types/types.js';
var GameState = /** @class */ (function () {
    function GameState(playerUnit, maps) {
        this.screen = GameScreen.TITLE;
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
export default GameState;
//# sourceMappingURL=GameState.js.map