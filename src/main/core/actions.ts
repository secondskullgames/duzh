import GameState from './GameState';
import Unit from '../units/Unit';
import SpriteRenderer from '../graphics/SpriteRenderer';
import MapFactory from '../maps/MapFactory';
import UnitClasses from '../units/UnitClasses';
import Music from '../sounds/Music';
import { contains, isTileRevealed } from '../maps/MapUtils';
import { createMap } from '../maps/MapSupplier';
import { attachEvents } from './InputHandler';

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
    // test
    //MapFactory.randomMap(20, 10, 3, 1),

    MapFactory.createRandomMap(1, 30, 22, 5, 4),
    MapFactory.createRandomMap(2, 32, 23, 6, 4),
    MapFactory.createRandomMap(3, 34, 24, 7, 3),
    MapFactory.createRandomMap(4, 36, 25, 8, 3),
    MapFactory.createRandomMap(5, 38, 26, 9, 3),
    MapFactory.createRandomMap(6, 30, 27, 10, 3)
  ]);

  jwb.renderer = new SpriteRenderer();

  loadMap(0);
  attachEvents();
  jwb.renderer.render();
  //Music.playSuite(randChoice([Music.SUITE_1, Music.SUITE_2]));
  Music.playSuite(Music.SUITE_3);
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

function debug() {
  jwb.DEBUG = true;
  jwb.renderer.render();
}

export {
  loadMap,
  restartGame,
  revealTiles,
  debug
};
