import TileFactory from '../types/TileFactory';
import UnitFactory from '../units/UnitFactory';
import GameState from './GameState';
import SpriteRenderer from '../graphics/SpriteRenderer';
import MapFactory from '../maps/MapFactory';
import UnitClass from '../units/UnitClass';
import Music from '../sounds/Music';
import { attachEvents } from './InputHandler';
import { GameScreen, MapLayout } from '../types/types';
import { contains, isTileRevealed } from '../maps/MapUtils';
import PlayerUnitController from '../units/controllers/PlayerUnitController';

let renderer: SpriteRenderer;

const loadMap = async (index: number) => {
  const { state } = jwb;
  if (index >= state.maps.length) {
    Music.stop();
    jwb.state.screen = GameScreen.VICTORY;
  } else {
    state.mapIndex = index;
    // TODO - this isn't memoized
    const mapBuilder = state.maps[index]();
    state.setMap(await mapBuilder.build());
  }
};

const initialize = async () => {
  // @ts-ignore
  window.jwb = window.jwb || {};
  renderer = new SpriteRenderer();
  const container = document.getElementById('container') as HTMLElement;
  container.appendChild(renderer.canvas);
  attachEvents();
  await _initState();
  Music.playFigure(Music.TITLE_THEME);
  return render();
};

const render = async () => {
  const imageBitmap = await renderer.render();
};

const _initState = async () => {
  const playerUnitController = new PlayerUnitController();
  const playerUnit = await UnitFactory.createUnit({
    name: 'player',
    unitClass: UnitClass.PLAYER,
    controller: playerUnitController,
    level: 1,
    coordinates: { x: 0, y: 0 }
  });

  const dungeonTileSet = await TileFactory.createTileSet('dungeon');
  const caveTileSet = await TileFactory.createTileSet('cave');

  jwb.state = new GameState(playerUnit, [
    () => MapFactory.createRandomMap(MapLayout.ROOMS_AND_CORRIDORS, dungeonTileSet, 1, 32, 24, 10, 5),
    () => MapFactory.createRandomMap(MapLayout.ROOMS_AND_CORRIDORS, dungeonTileSet, 2, 32, 24, 11, 4),
    () => MapFactory.createRandomMap(MapLayout.ROOMS_AND_CORRIDORS, dungeonTileSet, 3, 32, 24, 12, 3),
    () => MapFactory.createRandomMap(MapLayout.BLOB, caveTileSet, 4, 34, 25, 12, 3),
    () => MapFactory.createRandomMap(MapLayout.BLOB, caveTileSet, 5, 36, 26, 13, 3),
    () => MapFactory.createRandomMap(MapLayout.BLOB, caveTileSet, 6, 38, 27, 14, 3)
  ]);
};

const startGame = async () => {
  await loadMap(0);
  Music.stop();
  Music.playFigure(Music.TITLE_THEME);
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  return render();
};

const returnToTitle = async () => {
  await _initState(); // will set state.screen = TITLE
  Music.stop();
  Music.playFigure(Music.TITLE_THEME);
  return render();
};

/**
 * Add any tiles the player can currently see to the map's revealed tiles list.
 */
const revealTiles = () => {
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
};

export {
  initialize,
  loadMap,
  render,
  returnToTitle,
  revealTiles,
  startGame
};
