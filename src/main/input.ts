import { loadMap, moveOrAttack } from './actions';
import { pickupItem, useItem } from './utils/ItemUtils';
import { GameScreen, ItemCategory } from './types';
import TurnHandler from './classes/TurnHandler';
import Tiles from './types/Tiles';
import { resolvedPromise } from './utils/PromiseUtils';
import Sounds from './Sounds';
import { playSound } from './audio';

let BUSY = false;

function keyHandlerWrapper(e: KeyboardEvent) {
  if (!BUSY) {
    BUSY = true;
    keyHandler(e)
      .then(() => { BUSY = false; });
  }
}

function keyHandler(e: KeyboardEvent): Promise<void> {
  switch (e.key) {
    case 'w':
    case 'a':
    case 's':
    case 'd':
    case 'ArrowUp':
    case 'ArrowLeft':
    case 'ArrowDown':
    case 'ArrowRight':
      return _handleArrowKey(e.key);
    case ' ': // spacebar
      return TurnHandler.playTurn(null, true);
    case 'Enter':
      return _handleEnter();
    case 'Tab':
      e.preventDefault();
      return _handleTab();
    default:
  }
  return resolvedPromise();
}

function _handleArrowKey(key): Promise<void> {
  const { state } = jwb;
  const { playerUnit, screen } = state;
  const { inventory } = playerUnit;

  switch (screen) {
    case GameScreen.GAME:
      let [dx, dy] = [null, null];
      switch (key) {
        case 'w':
        case 'ArrowUp':
          [dx, dy] = [0, -1];
          break;
        case 'a':
        case 'ArrowLeft':
          [dx, dy] = [-1, 0];
          break;
        case 's':
        case 'ArrowDown':
          [dx, dy] = [0, 1];
          break;
        case 'd':
        case 'ArrowRight':
          [dx, dy] = [1, 0];
          break;
        default:
          throw `Invalid key ${key}`;
      }

      playerUnit.queuedOrder = u => moveOrAttack(u, { x: u.x + dx, y: u.y + dy });
      return TurnHandler.playTurn(
        u => moveOrAttack(u, { x: u.x + dx, y: u.y + dy }),
        true
      );
    case GameScreen.INVENTORY:
      const { inventoryCategory } = state;
      const items = inventory[inventoryCategory];
      const inventoryKeys = <ItemCategory[]>Object.keys(inventory);
      let keyIndex = inventoryKeys.indexOf(inventoryCategory);
      switch (key) {
        case 'w':
        case 'ArrowUp':
          state.inventoryIndex = (state.inventoryIndex + items.length - 1) % items.length;
          break;
        case 'a':
        case 'ArrowLeft':
        {
          keyIndex = (keyIndex + inventoryKeys.length - 1) % inventoryKeys.length;
          state.inventoryCategory = inventoryKeys[keyIndex];
          state.inventoryIndex = 0;
          break;
        }
        case 's':
        case 'ArrowDown':
          state.inventoryIndex = (state.inventoryIndex + 1) % items.length;
          break;
        case 'd':
        case 'ArrowRight':
        {
          keyIndex = (keyIndex + 1) % inventoryKeys.length;
          state.inventoryCategory = inventoryKeys[keyIndex];
          state.inventoryIndex = 0;
          break;
        }
      }
      return TurnHandler.playTurn(null, false);
    default:
      throw `fux`;
  }
}

function _handleEnter(): Promise<void> {
  const { state } = jwb;
  const { playerUnit, screen } = state;
  const { inventory } = playerUnit;

  switch (screen) {
    case GameScreen.GAME: {
      const { map, mapIndex } = state;
      const { x, y } = playerUnit;
      const item = map.getItem({ x, y });
      if (!!item) {
        pickupItem(playerUnit, item);
        map.removeItem({ x, y });
      } else if (map.getTile({ x, y }) === Tiles.STAIRS_DOWN) {
        playSound(Sounds.DESCEND_STAIRS);
        loadMap(mapIndex + 1);
      }
      return TurnHandler.playTurn(null, true);
    }
    case GameScreen.INVENTORY: {
      const { inventoryCategory, inventoryIndex } = state;
      const items = inventory[inventoryCategory];
      const item = items[inventoryIndex] || null;
      state.screen = GameScreen.GAME;
      return useItem(playerUnit, item)
        .then(() => TurnHandler.playTurn(null, false));
    }
    default:
      throw `fux`;
  }
}

function _handleTab(): Promise<void> {
  const { state } = jwb;
  const { playerUnit } = state;

  switch (state.screen) {
    case GameScreen.INVENTORY:
      state.screen = GameScreen.GAME;
      break;
    default:
      state.screen = GameScreen.INVENTORY;
      state.inventoryCategory = state.inventoryCategory || <any>Object.keys(playerUnit.inventory)[0] || null;
      break;
  }
  return TurnHandler.playTurn(null, false);
}

function attachEvents() {
  window.onkeydown = keyHandlerWrapper;
}

export {
  attachEvents,
  keyHandler as simulateKeyPress
};
