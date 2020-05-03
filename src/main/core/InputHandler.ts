import TurnHandler from './TurnHandler';
import Sounds from '../sounds/Sounds';
import Unit from '../units/Unit';
import { pickupItem, useItem } from '../items/ItemUtils';
import { resolvedPromise } from '../utils/PromiseUtils';
import { fireProjectile, moveOrAttack } from '../units/UnitUtils';
import { playSound } from '../sounds/AudioUtils';
import { loadMap, restartGame, startGame } from './actions';
import { Coordinates, GameScreen, TileType } from '../types/types';

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
  SPACEBAR = 'SPACEBAR'
}

function _mapToCommand(e: KeyboardEvent): (KeyCommand | null) {
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
  }
  return null;
}

let BUSY = false;

function keyHandlerWrapper(e: KeyboardEvent) {
  if (!BUSY) {
    BUSY = true;
    keyHandler(e)
      .then(() => { BUSY = false; });
  }
}

function keyHandler(e: KeyboardEvent): Promise<void> {
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
    default:
  }
  return resolvedPromise();
}

function _handleArrowKey(command: KeyCommand): Promise<void> {
  const { state } = jwb;

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
            return (u: Unit) => fireProjectile(u, { dx, dy });
          default:
            return (u: Unit) => moveOrAttack(u, { x: u.x + dx, y: u.y + dy });
        }
      })();
      return TurnHandler.playTurn(queuedOrder);
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
      return jwb.renderer.render();
    case GameScreen.TITLE:
    case GameScreen.VICTORY:
    case GameScreen.GAME_OVER:
      return resolvedPromise();
    default:
      throw `Invalid game screen ${state.screen}`;
  }
}

function _handleEnter(): Promise<void> {
  const { state } = jwb;
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
      } else if (map.getTile({ x, y }).type === TileType.STAIRS_DOWN) {
        playSound(Sounds.DESCEND_STAIRS);
        loadMap(mapIndex + 1);
      }
      return TurnHandler.playTurn(null);
    }
    case GameScreen.INVENTORY: {
      const { playerUnit } = state;
      const { selectedItem } = playerUnit.inventory;

      if (!!selectedItem) {
        state.screen = GameScreen.GAME;
        return useItem(playerUnit, selectedItem)
          .then(() => jwb.renderer.render());
      }
      return resolvedPromise();
    }
    case GameScreen.TITLE:
      jwb.state.screen = GameScreen.GAME;
      return startGame();
    case GameScreen.VICTORY:
    case GameScreen.GAME_OVER:
      jwb.state.screen = GameScreen.GAME;
      return restartGame();
    default:
      throw `Unknown game screen: ${state.screen}`;
  }
}

function _handleTab(): Promise<void> {
  const { state, renderer } = jwb;

  switch (state.screen) {
    case GameScreen.INVENTORY:
      state.screen = GameScreen.GAME;
      break;
    default:
      state.screen = GameScreen.INVENTORY;
      break;
  }
  return renderer.render();
}

function attachEvents() {
  window.onkeydown = keyHandlerWrapper;
}

export {
  attachEvents,
  keyHandler as simulateKeyPress
};
