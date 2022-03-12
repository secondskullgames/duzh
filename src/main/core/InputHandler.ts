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

  switch (e.code) {
    case 'KeyW':
    case 'ArrowUp':
      return { key: 'UP', modifiers };
    case 'KeyS':
    case 'ArrowDown':
      return { key: 'DOWN', modifiers };
    case 'KeyA':
    case 'ArrowLeft':
      return { key: 'LEFT', modifiers };
    case 'KeyD':
    case 'ArrowRight':
      return { key: 'RIGHT', modifiers };
    case 'Tab':
      return { key: 'TAB', modifiers };
    case 'Enter':
      return { key: 'ENTER', modifiers };
    case 'Space':
      return { key: 'SPACEBAR', modifiers };
    case 'KeyM':
      return { key: 'M', modifiers };
    case 'Digit1':
      return { key: '1', modifiers };
    case 'Digit2':
      return { key: '2', modifiers };
    case 'Digit3':
      return { key: '3', modifiers };
    case 'Digit4':
      return { key: '4', modifiers };
    case 'Digit5':
      return { key: '5', modifiers };
    case 'Digit6':
      return { key: '6', modifiers };
    case 'Digit7':
      return { key: '7', modifiers };
    case 'Digit8':
      return { key: '8', modifiers };
    case 'Digit9':
      return { key: '9', modifiers };
    case 'AltLeft':
    case 'AltRight':
    case 'ShiftLeft':
    case 'ShiftRight':
    case 'ControlLeft':
    case 'ControlRight':
    case 'OSLeft':
    case 'OSRight':
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
      const { x, y } = { x: playerUnit.x + dx, y: playerUnit.y + dy };

      let queuedOrder: PromiseSupplier | null = null;
      if (modifiers.includes('SHIFT')) {
        if (playerUnit.getEquipment().getBySlot('RANGED_WEAPON') && playerUnit.canSpendMana(UnitAbility.SHOOT_ARROW.manaCost)) {
          queuedOrder = () => UnitAbility.SHOOT_ARROW.use(playerUnit, { x, y });
        }
      } else if (modifiers.includes('ALT')) {
        if (playerUnit.canSpendMana(UnitAbility.BLINK.manaCost)) {
          const target: Coordinates = { x: playerUnit.x + 2 * dx, y: playerUnit.y + 2 * dy };
          queuedOrder = () => UnitAbility.BLINK.use(playerUnit, target);
        }
      } else {
        const ability = state.getQueuedAbility();
        if (ability !== null) {
          queuedOrder = async () => {
            state.setQueuedAbility(null);
            await ability.use(playerUnit, { x, y });
          };
        } else {
          queuedOrder = () => UnitAbility.ATTACK.use(playerUnit, { x, y });
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
  const ability = playerUnit.getAbilities()[index - 1];
  if (ability && playerUnit.canSpendMana(ability.manaCost)) {
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
  const canvas = document.querySelector('#container canvas') as HTMLCanvasElement;
  canvas.addEventListener('keydown', keyHandlerWrapper);
};

export {
  attachEvents
};
