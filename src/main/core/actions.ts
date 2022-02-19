import GameRenderer from '../graphics/renderers/GameRenderer';
import MapFactory from '../maps/MapFactory';
import GeneratedMapModel from '../maps/generated/GeneratedMapModel';
import MapInstance from '../maps/MapInstance';
import MapSpec from '../maps/MapSpec';
import { contains, isTileRevealed } from '../maps/MapUtils';
import PredefinedMapModel from '../maps/predefined/PredefinedMapModel';
import Music from '../sounds/Music';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import TileSet from '../tiles/TileSet';
import { GameScreen } from '../types/types';
import UnitFactory from '../units/UnitFactory';
import GameState from './GameState';
import { attachEvents } from './InputHandler';

let renderer: GameRenderer;

const loadMap = async (index: number) => {
  const state = GameState.getInstance();
  if (index >= state.maps.length) {
    Music.stop();
    state.screen = GameScreen.VICTORY;
  } else {
    state.mapIndex = index;
    const mapSpec = state.maps[index];
    const mapInstance = await _loadMap(mapSpec);
    state.setMap(mapInstance);
  }
};

const _loadMap = async (map: MapSpec): Promise<MapInstance> => {
  switch (map.type) {
    case 'generated': {
      const mapModel = await GeneratedMapModel.load(map.id);
      const mapBuilder = await MapFactory.loadGeneratedMap(mapModel);
      return mapBuilder.build();
    }
    case 'predefined': {
      const mapModel = await PredefinedMapModel.load(map.id);
      return  MapFactory.loadPredefinedMap(mapModel);
    }
  }
};

const initialize = async () => {
  renderer = new GameRenderer();
  const container = document.getElementById('container') as HTMLElement;
  container.appendChild(renderer.getCanvas());
  await _initState();
  attachEvents();
  const evilTheme = await Music.loadMusic('evil');
  Music.playMusic(evilTheme);
  await render();
  await TileSet.preload();
};

const render = async () => renderer.render();

const _initState = async () => {
  const playerUnit = await UnitFactory.createPlayerUnit();

  const maps: MapSpec[] = [
    { type: 'generated', id: '1' },
    { type: 'generated', id: '2' },
    { type: 'generated', id: '3' },
    { type: 'generated', id: '4' },
    { type: 'generated', id: '5' },
    { type: 'generated', id: '6' }
  ];
  const state = new GameState({ playerUnit, maps });

  GameState.setInstance(state);
};

const startGame = async () => {
  await loadMap(0);
  Music.stop();
  // Music.playFigure(Music.TITLE_THEME);
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  await render();
};

const startGameDebug = async () => {
  const mapInstance = await _loadMap({ type: 'predefined', id: 'test' });
  GameState.getInstance().setMap(mapInstance);
  Music.stop();
  // Music.playFigure(Music.TITLE_THEME);
  // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
  await render();
};

const returnToTitle = async () => {
  await _initState(); // will set state.screen = TITLE
  Music.stop();
  const titleTheme = await Music.loadMusic('title_theme');
  Music.playMusic(titleTheme);
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

const gameOver = async () => {
  const state = GameState.getInstance();
  state.screen = GameScreen.GAME_OVER;
  Music.stop();
  playSound(Sounds.GAME_OVER);
};

export {
  gameOver,
  initialize,
  loadMap,
  render,
  returnToTitle,
  revealTiles,
  startGame,
  startGameDebug
};
