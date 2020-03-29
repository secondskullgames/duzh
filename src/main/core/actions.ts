import GameState from './GameState';
import Unit from '../units/Unit';
import SpriteRenderer from '../graphics/SpriteRenderer';
import MapFactory from '../maps/MapFactory';
import UnitClasses from '../units/UnitClasses';
import Music from '../sounds/Music';
import TileSets from '../maps/TileSets';
import { contains, isTileRevealed } from '../maps/MapUtils';
import { createMap } from '../maps/MapSupplier';
import { attachEvents } from './InputHandler';
import { randChoice } from '../utils/RandomUtils';

function loadMap(index: number) {
  const { state } = jwb;
  if (index >= state.mapSuppliers.length) {
    alert('YOU WIN!');
  } else {
    state.mapIndex = index;
    state.setMap(createMap(state.mapSuppliers[index]));
  }
}

function restartGame() {
  const playerUnit = new Unit(UnitClasses.PLAYER, 'player', 1, { x: 0, y: 0 });
  jwb.state = new GameState(playerUnit, [
    MapFactory.createRandomMap(TileSets.DUNGEON, 1, 30, 22, 9, 4),
    MapFactory.createRandomMap(TileSets.DUNGEON, 2, 32, 23, 10, 4),
    MapFactory.createRandomMap(TileSets.DUNGEON, 3, 34, 24, 11, 3),
    MapFactory.createRandomMap(TileSets.CAVE,    4, 36, 25, 12, 3),
    MapFactory.createRandomMap(TileSets.CAVE,    5, 38, 26, 13, 3),
    MapFactory.createRandomMap(TileSets.CAVE,    6, 30, 27, 14, 3)
  ]);

  jwb.renderer = new SpriteRenderer();

  loadMap(0);
  attachEvents();
  jwb.renderer.render();
  Music.playSuite(randChoice([Music.SUITE_1, Music.SUITE_2, Music.SUITE_3]));
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
  loadMap,
  restartGame,
  revealTiles,
};
