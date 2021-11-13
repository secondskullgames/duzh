import GameState from './GameState';
import TurnHandler from './TurnHandler';
import Sounds from '../sounds/Sounds';
import Unit from '../units/Unit';
import { pickupItem, useItem } from '../items/ItemUtils';
import { playSound } from '../sounds/SoundFX';
import { loadMap, render, returnToTitle, startGame } from './actions';
import { Coordinates, GameScreen} from '../types/types';
import UnitAbility from '../units/UnitAbility';

enum KeyCommand {
  UP = 'UP',
  LEFT = 'LEFT',
  DOWN = 'DOWN',
  RIGHT = 'RIGHT',
  SHIFT_UP = 'SHIFT_UP',
  SHIFT_LEFT = 'SHIFT_LEFT',
  SHIFT_DOWN = 'SHIFT_DOWN',
  SHIFT_RIGHT = 'SHIFT_RIGHT',
  TAB = 'TAB',
  ENTER = 'ENTER',
  SPACEBAR = 'SPACEBAR',
  M = 'M',
  KEY_1 = '1',
  KEY_2 = '2',
  KEY_3 = '3',
  KEY_4 = '4',
  KEY_5 = '5',
  KEY_6 = '6',
  KEY_7 = '7',
  KEY_8 = '8',
  KEY_9 = '9',
  KEY_0 = '0'
}

const _mapToCommand = (e: KeyboardEvent): (KeyCommand | null) => {
  switch (e.key) {
    case 'w':
    case 'W':
    case 'ArrowUp':
      return (e.shiftKey ? KeyCommand.SHIFT_UP : KeyCommand.UP);
    case 's':
    case 'S':
    case 'ArrowDown':
      return (e.shiftKey ? KeyCommand.SHIFT_DOWN : KeyCommand.DOWN);
    case 'a':
    case 'A':
    case 'ArrowLeft':
      return (e.shiftKey ? KeyCommand.SHIFT_LEFT : KeyCommand.LEFT);
    case 'd':
    case 'D':
    case 'ArrowRight':
      return (e.shiftKey ? KeyCommand.SHIFT_RIGHT : KeyCommand.RIGHT);
    case 'Tab':
      return KeyCommand.TAB;
    case 'Enter':
      return KeyCommand.ENTER;
    case ' ':
      return KeyCommand.SPACEBAR;
    case 'm':
    case 'M':
      return KeyCommand.M;
    case '1':
      return KeyCommand.KEY_1;
    case '2':
      return KeyCommand.KEY_2;
    case '3':
      return KeyCommand.KEY_3;
    case '4':
      return KeyCommand.KEY_4;
    case '5':
      return KeyCommand.KEY_5;
    case '6':
      return KeyCommand.KEY_6;
    case '7':
      return KeyCommand.KEY_7;
    case '8':
      return KeyCommand.KEY_8;
    case '9':
      return KeyCommand.KEY_9;
    case '0':
      return KeyCommand.KEY_0;
  }
  return null;
};

// global state

let BUSY = false;

const keyHandlerWrapper = async (e: KeyboardEvent) => {
  if (!BUSY) {
    BUSY = true;
    await keyHandler(e);
    BUSY = false;
  }
};

const keyHandler = async (e: KeyboardEvent) => {
  const command : (KeyCommand | null) = _mapToCommand(e);

  switch (command) {
    case KeyCommand.UP:
    case KeyCommand.LEFT:
    case KeyCommand.DOWN:
    case KeyCommand.RIGHT:
    case KeyCommand.SHIFT_UP:
    case KeyCommand.SHIFT_DOWN:
    case KeyCommand.SHIFT_LEFT:
    case KeyCommand.SHIFT_RIGHT:
      return _handleArrowKey(command);
    case KeyCommand.SPACEBAR:
      return TurnHandler.playTurn(null);
    case KeyCommand.ENTER:
      return _handleEnter();
    case KeyCommand.TAB:
      e.preventDefault();
      return _handleTab();
    case KeyCommand.M:
      return _handleMap();
    case KeyCommand.KEY_1:
    case KeyCommand.KEY_2:
    case KeyCommand.KEY_3:
    case KeyCommand.KEY_4:
    case KeyCommand.KEY_5:
    case KeyCommand.KEY_6:
    case KeyCommand.KEY_7:
    case KeyCommand.KEY_8:
    case KeyCommand.KEY_9:
    case KeyCommand.KEY_0:
      return _handleAbility(command);
    default:
      return Promise.resolve();
  }
};

const _handleArrowKey = async (command: KeyCommand) => {
  const state = GameState.getInstance();

  switch (state.screen) {
    case GameScreen.GAME:
      let dx: number;
      let dy: number;

      switch (command) {
        case KeyCommand.UP:
        case KeyCommand.SHIFT_UP:
          [dx, dy] = [0, -1];
          break;
        case KeyCommand.DOWN:
        case KeyCommand.SHIFT_DOWN:
          [dx, dy] = [0, 1];
          break;
        case KeyCommand.LEFT:
        case KeyCommand.SHIFT_LEFT:
          [dx, dy] = [-1, 0];
          break;
        case KeyCommand.RIGHT:
        case KeyCommand.SHIFT_RIGHT:
          [dx, dy] = [1, 0];
          break;
        default:
          throw `Invalid direction command ${command}`;
      }

      const queuedOrder: (unit: Unit) => Promise<void> = (() => {
        switch (command) {
          case KeyCommand.SHIFT_UP:
          case KeyCommand.SHIFT_DOWN:
          case KeyCommand.SHIFT_LEFT:
          case KeyCommand.SHIFT_RIGHT:
            return (u: Unit) => UnitAbility.SHOOT_ARROW.use(u, { dx, dy });
          default:
            if (state.queuedAbility) {
              const ability = state.queuedAbility;
              state.queuedAbility = null;
              return (u: Unit) => ability.use(u, { dx, dy });
            }
            return (u: Unit) => UnitAbility.ATTACK.use(u, { dx, dy });
        }
      })();
      await TurnHandler.playTurn(queuedOrder);
      break;
    case GameScreen.INVENTORY:
      const { inventory } = state.playerUnit;

      switch (command) {
        case KeyCommand.UP:
        case KeyCommand.SHIFT_UP:
          inventory.previousItem();
          break;
        case KeyCommand.DOWN:
        case KeyCommand.SHIFT_DOWN:
          inventory.nextItem();
          break;
        case KeyCommand.LEFT:
        case KeyCommand.SHIFT_LEFT:
          inventory.previousCategory();
          break;
        case KeyCommand.RIGHT:
        case KeyCommand.SHIFT_RIGHT:
          inventory.nextCategory();
          break;
      }
      await render();
      break;
    case GameScreen.TITLE:
    case GameScreen.VICTORY:
    case GameScreen.GAME_OVER:
    case GameScreen.MINIMAP:
      break;
    default:
      throw `Invalid game screen ${state.screen}`;
  }
};

const _handleEnter = async () => {
  const state = GameState.getInstance();
  const { playerUnit } = state;

  switch (state.screen) {
    case GameScreen.GAME: {
      const { mapIndex } = state;
      const map = state.getMap();
      const { x, y }: Coordinates = playerUnit;
      if (!map || (mapIndex === null)) {
        throw 'Map is not loaded!';
      }
      const item = map.getItem({ x, y });
      if (!!item) {
        pickupItem(playerUnit, item);
        map.removeItem({ x, y });
      } else if (map.getTile({ x, y }).type === 'STAIRS_DOWN') {
        playSound(Sounds.DESCEND_STAIRS);
        await loadMap(mapIndex + 1);
      }
      await TurnHandler.playTurn(null);
      break;
    }
    case GameScreen.INVENTORY: {
      const { playerUnit } = state;
      const { selectedItem } = playerUnit.inventory;

      if (!!selectedItem) {
        state.screen = GameScreen.GAME;
        await useItem(playerUnit, selectedItem);
        await render();
      }
      break;
    }
    case GameScreen.TITLE:
      state.screen = GameScreen.GAME;
      await startGame();
      break;
    case GameScreen.VICTORY:
    case GameScreen.GAME_OVER:
      await returnToTitle();
      break;
    default:
      throw `Unknown game screen: ${state.screen}`;
  }
};

const _handleTab = async () => {
  const state = GameState.getInstance();

  switch (state.screen) {
    case GameScreen.INVENTORY:
      state.screen = GameScreen.GAME;
      break;
    default:
      state.screen = GameScreen.INVENTORY;
      break;
  }
  return await render();
};

const _handleMap = async () => {
  const state = GameState.getInstance();

  switch (state.screen) {
    case GameScreen.MINIMAP:
      state.screen = GameScreen.GAME;
      break;
    case GameScreen.GAME:
    case GameScreen.INVENTORY:
      state.screen = GameScreen.MINIMAP;
      break;
    default:
      break;
  }
  await render();
};

const _handleAbility = async (command: KeyCommand) => {
  const state = GameState.getInstance();
  const { playerUnit } = state;

  // sketchy - recall KEY_1 = '1', etc.
  // player abilities are indexed as (0 => attack, others => specials)
  const index = parseInt(command.toString());
  const ability = playerUnit.abilities[index];
  if (playerUnit.getCooldown(ability) <= 0) {
    state.queuedAbility = ability;
    await render();
  } else {
    console.log(`${ability.name} is on cooldown: ${playerUnit.getCooldown(UnitAbility.HEAVY_ATTACK)}`);
  }
};

const attachEvents = () => {
  window.onkeydown = keyHandlerWrapper;
};

export {
  attachEvents
};
