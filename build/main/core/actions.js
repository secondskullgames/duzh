"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameState_1 = require("./GameState");
var Unit_1 = require("../units/Unit");
var SpriteRenderer_1 = require("../graphics/SpriteRenderer");
var MapFactory_1 = require("../maps/MapFactory");
var UnitClasses_1 = require("../units/UnitClasses");
var Music_1 = require("../sounds/Music");
var TileSets_1 = require("../maps/TileSets");
var InputHandler_1 = require("./InputHandler");
var types_1 = require("../types/types");
var MapUtils_1 = require("../maps/MapUtils");
/*
 * This file defines functions that will be exported to the "global namespace" (window.jwb.*).
 */
function loadMap(index) {
    var state = jwb.state;
    if (index >= state.maps.length) {
        Music_1.default.stop();
        jwb.state.screen = types_1.GameScreen.VICTORY;
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
    Music_1.default.playFigure(Music_1.default.TITLE_THEME);
    return jwb.renderer.render();
}
exports.initialize = initialize;
function _initState() {
    var playerUnit = new Unit_1.default(UnitClasses_1.default.PLAYER, 'player', 1, { x: 0, y: 0 });
    jwb.state = new GameState_1.default(playerUnit, [
        function () { return MapFactory_1.default.createRandomMap(types_1.MapLayout.ROOMS_AND_CORRIDORS, TileSets_1.default.DUNGEON, 1, 32, 24, 10, 5); },
        function () { return MapFactory_1.default.createRandomMap(types_1.MapLayout.ROOMS_AND_CORRIDORS, TileSets_1.default.DUNGEON, 2, 32, 24, 11, 4); },
        function () { return MapFactory_1.default.createRandomMap(types_1.MapLayout.ROOMS_AND_CORRIDORS, TileSets_1.default.DUNGEON, 3, 32, 24, 12, 3); },
        function () { return MapFactory_1.default.createRandomMap(types_1.MapLayout.BLOB, TileSets_1.default.CAVE, 4, 34, 25, 12, 3); },
        function () { return MapFactory_1.default.createRandomMap(types_1.MapLayout.BLOB, TileSets_1.default.CAVE, 5, 36, 26, 13, 3); },
        function () { return MapFactory_1.default.createRandomMap(types_1.MapLayout.BLOB, TileSets_1.default.CAVE, 6, 38, 27, 14, 3); }
    ]);
}
function startGame() {
    loadMap(0);
    Music_1.default.stop();
    // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
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
        if (MapUtils_1.contains(room, playerUnit)) {
            for (var y = room.top; y < room.top + room.height; y++) {
                for (var x = room.left; x < room.left + room.width; x++) {
                    if (!MapUtils_1.isTileRevealed({ x: x, y: y })) {
                        map.revealedTiles.push({ x: x, y: y });
                    }
                }
            }
        }
    });
    var radius = 2;
    for (var y = playerUnit.y - radius; y <= playerUnit.y + radius; y++) {
        for (var x = playerUnit.x - radius; x <= playerUnit.x + radius; x++) {
            if (!MapUtils_1.isTileRevealed({ x: x, y: y })) {
                map.revealedTiles.push({ x: x, y: y });
            }
        }
    }
}
exports.revealTiles = revealTiles;
//# sourceMappingURL=actions.js.map