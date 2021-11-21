import GameRenderer from '../graphics/renderers/GameRenderer';
import MapFactory from '../maps/MapFactory';
import MapModel from '../maps/MapModel';
import { contains, isTileRevealed } from '../maps/MapUtils';
import Music from '../sounds/Music';
import TileSet from '../types/TileSet';
import { GameScreen } from '../types/types';
import PlayerUnitController from '../units/controllers/PlayerUnitController';
import UnitClass from '../units/UnitClass';
import UnitFactory from '../units/UnitFactory';
import GameState from './GameState';
import { attachEvents } from './InputHandler';

let renderer: GameRenderer;

const loadMap = async (index: number) => {
  const state = GameState.getInstance();
  if (index >= state.mapIds.length) {
    Music.stop();
    state.screen = GameScreen.VICTORY;
  } else {
    state.mapIndex = index;
    const mapId = state.mapIds[index];
    const mapModel = await MapModel.load(mapId);
    const mapBuilder = await MapFactory.loadMap(mapModel);
    state.setMap(await mapBuilder.build());
  }
};

const initialize = async () => {
  renderer = new GameRenderer();
  const container = document.getElementById('container') as HTMLElement;
  container.appendChild(renderer.getCanvas());
  await _initState();
  attachEvents();
  Music.playFigure(Music.TITLE_THEME);
  await render();
  await TileSet.preload();
};

const render = async () => renderer.render();

const _initState = async () => {
  const playerUnitController = new PlayerUnitController();
  const playerUnit = await UnitFactory.createUnit({
    name: 'player',
    unitClass: UnitClass.PLAYER,
    controller: playerUnitController,
    level: 1,
    coordinates: { x: 0, y: 0 }
  });

  const mapIds = ['1', '2', '3', '4', '5', '6'];
  const state = new GameState(playerUnit, mapIds);

  GameState.setInstance(state);
};

const startGame = async () => {
  await loadMap(0);
  Music.stop();
  // Music.playFigure(Music.TITLE_THEME);
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  await render();
};

const returnToTitle = async () => {
  await _initState(); // will set state.screen = TITLE
  Music.stop();
  Music.playFigure(Music.TITLE_THEME);
  await render();
};

/**
 * Add any tiles the player can currently see to the map's revealed tiles list.
 */
const revealTiles = () => {
  const state = GameState.getInstance();
  const { playerUnit } = state;
  const map = state.getMap();

  for (const room of map.rooms) {
    if (contains(room, playerUnit)) {
      for (let y = room.top; y < room.top + room.height; y++) {
        for (let x = room.left; x < room.left + room.width; x++) {
          if (!isTileRevealed({ x, y })) {
            map.revealedTiles.push({ x, y });
          }
        }
      }
    }
  }

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
