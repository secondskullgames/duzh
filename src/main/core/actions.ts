import GameState from './GameState';
import Unit from '../units/Unit';
import SpriteRenderer from '../graphics/SpriteRenderer';
import MapFactory from '../maps/MapFactory';
import UnitClasses from '../units/UnitClasses';
import Music from '../sounds/Music';
import TileSets from '../maps/TileSets';
import { attachEvents } from './InputHandler';
import { randChoice } from '../utils/RandomUtils';
import { GameScreen, MapLayout } from '../types/types';
import { contains, isTileRevealed } from '../maps/MapUtils';
import { SUITE_1, SUITE_2, SUITE_3 } from '../sounds/Suites';

/*
 * This file defines functions that will be exported to the "global namespace" (window.jwb.*).
 */

function loadMap(index: number) {
  const { state } = jwb;
  if (index >= state.maps.length) {
    Music.stop();
    jwb.state.screen = GameScreen.VICTORY;
  } else {
    state.mapIndex = index;
    // TODO - this isn't memoized
    const mapBuilder = state.maps[index]();
    state.setMap(mapBuilder.build());
  }
}

function initialize(): Promise<any> {
  // @ts-ignore
  window.jwb = window.jwb || {};
  jwb.renderer = new SpriteRenderer();
  attachEvents();
  _initState();
  Music.playFigure(Music.TITLE_THEME);
  return jwb.renderer.render();
}

function _initState() {
  const playerUnit = new Unit(UnitClasses.PLAYER, 'player', 1, { x: 0, y: 0 });
  jwb.state = new GameState(playerUnit, [
    () => MapFactory.createRandomMap(MapLayout.ROOMS_AND_CORRIDORS, TileSets.DUNGEON, 1, 32, 24, 10, 5),
    () => MapFactory.createRandomMap(MapLayout.ROOMS_AND_CORRIDORS, TileSets.DUNGEON, 2, 32, 24, 11, 4),
    () => MapFactory.createRandomMap(MapLayout.ROOMS_AND_CORRIDORS, TileSets.DUNGEON, 3, 32, 24, 12, 3),
    () => MapFactory.createRandomMap(MapLayout.BLOB, TileSets.CAVE, 4, 34, 25, 12, 3),
    () => MapFactory.createRandomMap(MapLayout.BLOB, TileSets.CAVE, 5, 36, 26, 13, 3),
    () => MapFactory.createRandomMap(MapLayout.BLOB, TileSets.CAVE, 6, 38, 27, 14, 3)
  ]);
}

function startGame(): Promise<any> {
  loadMap(0);
  Music.stop();
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  return jwb.renderer.render();
}

function restartGame(): Promise<any> {
  _initState();
  return startGame();
}

/**
 * Add any tiles the player can currently see to the map's revealed tiles list.
 */
function revealTiles(): void {
  const { playerUnit } = jwb.state;
  const map = jwb.state.getMap();

  map.rooms.forEach(room => {
    if (contains(room, playerUnit)) {
      for (let y = room.top; y < room.top + room.height; y++) {
        for (let x = room.left; x < room.left + room.width; x++) {
          if (!isTileRevealed({ x, y })) {
            map.revealedTiles.push({ x, y });
          }
        }
      }
    }
  });

  const radius = 2;

  for (let y = playerUnit.y - radius; y <= playerUnit.y + radius; y++) {
    for (let x = playerUnit.x - radius; x <= playerUnit.x + radius; x++) {
      if (!isTileRevealed({ x, y })) {
        map.revealedTiles.push({ x, y });
      }
    }
  }
}

export {
  initialize,
  loadMap,
  restartGame,
  revealTiles,
  startGame
};
