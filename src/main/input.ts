import { loadMap, moveOrAttack, pickupItem, render, update, useItem } from './actions';
import { ItemCategory, Tiles } from './types';

/**
 * @param {!KeyboardEvent} e
 * @return {!Promise<void>}
 */
function keyHandler(e) {
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
      return update()
        .then(() => render());
    case 'Enter':
      return _handleEnter();
    case 'Tab':
      e.preventDefault();
      return _handleTab();
    default:
  }
  return new Promise(resolve => { resolve(); });
}

/**
 * @param {!string} key
 * @return {!Promise<void>}
 * @private
 */
function _handleArrowKey(key) {
  const { state } = jwb;
  const { playerUnit, screen } = state;
  const { inventory } = playerUnit;

  switch (screen) {
    case 'GAME':
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

      return update();
    case 'INVENTORY':
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
      return render();
    default:
      throw `fux`;
  }
}

function _handleEnter(): Promise<void> {
  const { state } = jwb;
  const { playerUnit, screen } = state;
  const { inventory } = playerUnit;

  switch (screen) {
    case 'GAME': {
      const { map, mapIndex } = state;
      const { x, y } = playerUnit;
      const item = map.getItem({ x, y });
      if (!!item) {
        pickupItem(playerUnit, item);
        map.removeItem({ x, y });
      } else if (map.getTile({ x, y }) === Tiles.STAIRS_DOWN) {
        loadMap(mapIndex + 1);
      }
      return update();
    }
    case 'INVENTORY': {
      const { inventoryCategory, inventoryIndex } = state;
      const items = inventory[inventoryCategory];
      const item = items[inventoryIndex] || null;
      useItem(playerUnit, item);
      return render();
    }
    default:
      throw `fux`;
  }
}

function _handleTab(): Promise<void> {
  const { state } = jwb;
  const { playerUnit } = state;

  switch (state.screen) {
    case 'INVENTORY':
      state.screen = 'GAME';
      break;
    default:
      state.screen = 'INVENTORY';
      state.inventoryCategory = state.inventoryCategory || <any>Object.keys(playerUnit.inventory)[0] || null;
      break;
  }
  return render();
}

function attachEvents() {
  window.onkeydown = keyHandler;
}

export {
  attachEvents,
  keyHandler as simulateKeyPress
};
