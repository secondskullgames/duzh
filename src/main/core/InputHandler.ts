import { pickupItem, useItem } from '../items/ItemUtils';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
import PlayerUnitController from '../units/controllers/PlayerUnitController';
import UnitAbility from '../units/UnitAbility';
import { checkNotNull } from '../utils/preconditions';
import { loadNextMap, render, returnToTitle, startGame, startGameDebug } from './actions';
import GameState from './GameState';
import TurnHandler from './TurnHandler';

type ArrowKey = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type NumberKey = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
/**
 * NONE is a special command (read: hack) that does nothing, but is a trigger to call preventDefault()
 */
type Key = ArrowKey | NumberKey | 'TAB' | 'ENTER' | 'SPACEBAR' | 'M' | 'NONE';

type ModifierKey = 'ALT' | 'CTRL' | 'SHIFT';

type KeyCommand = {
  key: Key,
  modifiers: ModifierKey[]
};

type PromiseSupplier = () => Promise<void>;

const _mapToCommand = (e: KeyboardEvent): (KeyCommand | null) => {
  const modifiers = [e.altKey && 'ALT', e.shiftKey && 'SHIFT', (e.ctrlKey || e.metaKey) && 'CTRL']
    .filter(x => x)
    .map(x => x as ModifierKey);

  switch (e.key) {
    case 'w':
    case 'W':
    case 'ArrowUp':
      return { key: 'UP', modifiers };
    case 's':
    case 'S':
    case 'ArrowDown':
      return { key: 'DOWN', modifiers };
    case 'a':
    case 'A':
    case 'ArrowLeft':
      return { key: 'LEFT', modifiers };
    case 'd':
    case 'D':
    case 'ArrowRight':
      return { key: 'RIGHT', modifiers };
    case 'Tab':
      return { key: 'TAB', modifiers };
    case 'Enter':
      return { key: 'ENTER', modifiers };
    case ' ':
      return { key: 'SPACEBAR', modifiers };
    case 'm':
    case 'M':
      return { key: 'M', modifiers };
    case '1':
      return { key: '1', modifiers };
    case '2':
      return { key: '2', modifiers };
    case '3':
      return { key: '3', modifiers };
    case '4':
      return { key: '4', modifiers };
    case '5':
      return { key: '5', modifiers };
    case '6':
      return { key: '6', modifiers };
    case '7':
      return { key: '7', modifiers };
    case '8':
      return { key: '8', modifiers };
    case '9':
      return { key: '9', modifiers };
    case 'Alt':
    case 'Shift':
    case 'Control':
      return { key: 'NONE', modifiers };
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

  if (!command) {
    return Promise.resolve();
  }

  e.preventDefault();

  switch (command.key) {
    case 'UP':
    case 'DOWN':
    case 'LEFT':
    case 'RIGHT':
      return _handleArrowKey(command.key, command.modifiers);
    case 'SPACEBAR':
      await playSound(Sounds.FOOTSTEP);
      return TurnHandler.playTurn();
    case 'ENTER':
      return _handleEnter(command.modifiers);
    case 'TAB':
      return _handleTab();
    case 'M':
      return _handleMap();
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
      return _handleAbility(command.key);
    case 'NONE':
    default: // not reachable
      return Promise.resolve();
  }
};

const _handleArrowKey = async (key: ArrowKey, modifiers: ModifierKey[]) => {
  const state = GameState.getInstance();

  switch (state.getScreen()) {
    case 'GAME':
      const { dx, dy } = _getDirection(key);

      const playerUnit = GameState.getInstance().getPlayerUnit();
      let queuedOrder: PromiseSupplier | null = null;
      if (modifiers.includes('SHIFT')) {
        if (playerUnit.getEquipment().getBySlot('RANGED_WEAPON')) {
          queuedOrder = () => UnitAbility.SHOOT_ARROW.use(playerUnit, { dx, dy });
        }
      // Blink is disabled for being really OP.  Here's how to enable it:
      //
      // } else if (modifiers.includes('ALT')) {
      //   if (playerUnit.getCooldown(UnitAbility.BLINK) <= 0) {
      //     queuedOrder = () => UnitAbility.BLINK.use(playerUnit, { dx, dy });
      //   }
      } else {
        const ability = state.getQueuedAbility();
        if (ability !== null) {
          queuedOrder = async () => {
            state.setQueuedAbility(null);
            await ability.use(playerUnit, { dx, dy });
          };
        } else {
          queuedOrder = () => UnitAbility.ATTACK.use(playerUnit, { dx, dy });
        }
      }
      const playerController = playerUnit.controller as PlayerUnitController;
      if (queuedOrder) {
        playerController.queuedOrder = queuedOrder;
        await TurnHandler.playTurn();
      }
      break;
    case 'INVENTORY':
      const inventory = state.getPlayerUnit().getInventory();

      switch (key) {
        case 'UP':
          inventory.previousItem();
          break;
        case 'DOWN':
          inventory.nextItem();
          break;
        case 'LEFT':
          inventory.previousCategory();
          break;
        case 'RIGHT':
          inventory.nextCategory();
          break;
      }
      await render();
      break;
    default:
      break;
  }
};

const _handleEnter = async (modifiers: ModifierKey[]) => {
  const state = GameState.getInstance();
   const playerUnit = state.getPlayerUnit();

  if (modifiers.includes('ALT')) {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.error(e);
    }
    return;
  }

  switch (state.getScreen()) {
    case 'GAME': {
      const map = checkNotNull(state.getMap(), 'Map is not loaded!');
      const { x, y }: Coordinates = playerUnit;
      const item = map.getItem({ x, y });
      if (!!item) {
        pickupItem(playerUnit, item);
        map.removeItem({ x, y });
      } else if (map.getTile({ x, y }).type === 'STAIRS_DOWN') {
        playSound(Sounds.DESCEND_STAIRS);
        await loadNextMap();
      }
      await TurnHandler.playTurn();
      break;
    }
    case 'INVENTORY': {
      const playerUnit = state.getPlayerUnit();
      const { selectedItem } = playerUnit.getInventory();

      if (!!selectedItem) {
        state.setScreen('GAME');
        await useItem(playerUnit, selectedItem);
        await render();
      }
      break;
    }
    case 'TITLE':
      state.setScreen('GAME');
      if (modifiers.includes('SHIFT')) {
        await startGameDebug();
      } else {
        await startGame();
      }
      break;
    case 'VICTORY':
    case 'GAME_OVER':
      await returnToTitle();
  }
};

const _handleTab = async () => {
  const state = GameState.getInstance();

  switch (state.getScreen()) {
    case 'INVENTORY':
      state.setScreen('GAME');
      break;
    default:
      state.setScreen('INVENTORY');
      break;
  }
  await render();
};

const _handleMap = async () => {
  const state = GameState.getInstance();

  switch (state.getScreen()) {
    case 'MINIMAP':
      state.setScreen('GAME');
      break;
    case 'GAME':
    case 'INVENTORY':
      state.setScreen('MINIMAP');
      break;
    default:
      break;
  }
  await render();
};

const _handleAbility = async (command: NumberKey) => {
  const state = GameState.getInstance();
  const playerUnit = state.getPlayerUnit();

  // sketchy - player abilities are indexed as (0 => attack, others => specials)
  const index = parseInt(command.toString());
  const ability = playerUnit.abilities[index - 1];
  if (playerUnit.getCooldown(ability) <= 0) {
    state.setQueuedAbility(ability);
    await render();
  }
};

const _getDirection = (key: ArrowKey): Direction => {
  switch (key) {
    case 'UP':
      return { dx: 0, dy: -1 };
    case 'DOWN':
      return { dx: 0, dy: 1 };
    case 'LEFT':
      return { dx: -1, dy: 0 };
    case 'RIGHT':
      return { dx: 1, dy: 0 };
  }
};

const attachEvents = () => {
  window.onkeydown = keyHandlerWrapper;
};

export {
  attachEvents
};
