import GameState from './GameState.js';
import Unit from '../units/Unit.js';
import SpriteRenderer from '../graphics/SpriteRenderer.js';
import MapFactory from '../maps/MapFactory.js';
import UnitClasses from '../units/UnitClasses.js';
import Music from '../sounds/Music.js';
import TileSets from '../maps/TileSets.js';
import { attachEvents } from './InputHandler.js';
import { randChoice } from '../utils/RandomUtils.js';
import { GameScreen, MapLayout } from '../types/types.js';
import { contains, isTileRevealed } from '../maps/MapUtils.js';
function loadMap(index) {
    var state = jwb.state;
    if (index >= state.maps.length) {
        Music.stop();
        jwb.state.screen = GameScreen.VICTORY;
    }
    else {
        state.mapIndex = index;
        // TODO - this isn't memoized
        var mapBuilder = state.maps[index]();
        state.setMap(mapBuilder.build());
    }
}
function initialize() {
    // @ts-ignore
    window.jwb = window.jwb || {};
    jwb.renderer = new SpriteRenderer();
    attachEvents();
    _initState();
    return jwb.renderer.render();
}
function _initState() {
    var playerUnit = new Unit(UnitClasses.PLAYER, 'player', 1, { x: 0, y: 0 });
    jwb.state = new GameState(playerUnit, [
        function () { return MapFactory.createRandomMap(MapLayout.ROOMS_AND_CORRIDORS, TileSets.DUNGEON, 1, 28, 22, 9, 4); },
        function () { return MapFactory.createRandomMap(MapLayout.ROOMS_AND_CORRIDORS, TileSets.DUNGEON, 2, 30, 23, 10, 4); },
        function () { return MapFactory.createRandomMap(MapLayout.ROOMS_AND_CORRIDORS, TileSets.DUNGEON, 3, 32, 24, 11, 3); },
        function () { return MapFactory.createRandomMap(MapLayout.BLOB, TileSets.CAVE, 4, 34, 25, 12, 3); },
        function () { return MapFactory.createRandomMap(MapLayout.BLOB, TileSets.CAVE, 5, 36, 26, 13, 3); },
        function () { return MapFactory.createRandomMap(MapLayout.BLOB, TileSets.CAVE, 6, 38, 27, 14, 3); }
    ]);
}
function startGame() {
    loadMap(0);
    Music.stop();
    Music.playSuite(randChoice([Music.SUITE_1, Music.SUITE_2, Music.SUITE_3]));
    return jwb.renderer.render();
}
function restartGame() {
    _initState();
    return startGame();
}
/**
 * Add any tiles the player can currently see to the map's revealed tiles list.
 */
function revealTiles() {
    var playerUnit = jwb.state.playerUnit;
    var map = jwb.state.getMap();
    map.rooms.forEach(function (room) {
        if (contains(room, playerUnit)) {
            for (var y = room.top; y < room.top + room.height; y++) {
                for (var x = room.left; x < room.left + room.width; x++) {
                    if (!isTileRevealed({ x: x, y: y })) {
                        map.revealedTiles.push({ x: x, y: y });
                    }
                }
            }
        }
    });
    var radius = 2;
    for (var y = playerUnit.y - radius; y <= playerUnit.y + radius; y++) {
        for (var x = playerUnit.x - radius; x <= playerUnit.x + radius; x++) {
            if (!isTileRevealed({ x: x, y: y })) {
                map.revealedTiles.push({ x: x, y: y });
            }
        }
    }
}
export { initialize, loadMap, restartGame, revealTiles, startGame };
//# sourceMappingURL=actions.js.map