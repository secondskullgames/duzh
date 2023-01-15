import { pickupItem, useItem } from '../items/ItemUtils';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
import PlayerUnitController from '../units/controllers/PlayerUnitController';
import UnitAbility from '../units/UnitAbility';
import { checkNotNull } from '../utils/preconditions';
import { initialize, loadNextMap, render, startGame, startGameDebug } from './actions';
import { GameEngine } from './GameEngine';
import GameState from './GameState';
import { GameDriver } from './GameDriver';

type ArrowKey = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type NumberKey = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0';
type FunctionKey = 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9' | 'F10' | 'F11' | 'F12';
/**
 * NONE is a special command (read: hack) that does nothing, but is a trigger to call preventDefault()
 */
type Key = ArrowKey | NumberKey | FunctionKey | 'TAB' | 'ENTER' | 'SPACEBAR' | 'M' | 'NONE';

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
    case 'NumpadEnter':
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
    case 'F1':
      return { key: 'F1', modifiers };
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

export class InputHandler {
  private readonly engine: GameEngine;
  private busy: boolean;
  constructor(engine: GameEngine) {
    this.engine = engine;
    this.busy = false;
  }

  keyHandlerWrapper = async (event: KeyboardEvent) => {
    if (!this.busy) {
      this.busy = true;
      await this.keyHandler(event);
      this.busy = false;
    }
  };

  keyHandler = async (e: KeyboardEvent): Promise<void> => {
    const command : (KeyCommand | null) = _mapToCommand(e);

    if (!command) {
      return;
    }

    e.preventDefault();

    switch (command.key) {
      case 'UP':
      case 'DOWN':
      case 'LEFT':
      case 'RIGHT':
        return this._handleArrowKey(command.key, command.modifiers);
      case 'SPACEBAR':
        playSound(Sounds.FOOTSTEP);
        return this.engine.playTurn();
      case 'ENTER':
        return this._handleEnter(command.modifiers);
      case 'TAB':
        return this._handleTab();
      case 'M':
        return this._handleMap();
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        return this._handleAbility(command.key);
      case 'F1':
        return this._handleF1();
      case 'NONE':
      default: // not reachable
        return;
    }
  };

  private _handleArrowKey = async (key: ArrowKey, modifiers: ModifierKey[]) => {
    const state = GameState.getInstance();

    switch (state.getScreen()) {
      case 'GAME':
        const { dx, dy } = this._getDirection(key);
        const playerUnit = GameState.getInstance().getPlayerUnit();
        const { x, y } = Coordinates.plus(playerUnit.getCoordinates(), { dx, dy });

        let queuedOrder: PromiseSupplier | null = null;
        if (modifiers.includes('SHIFT')) {
          if (playerUnit.getEquipment().getBySlot('RANGED_WEAPON') && playerUnit.canSpendMana(UnitAbility.SHOOT_ARROW.manaCost)) {
            queuedOrder = () => UnitAbility.SHOOT_ARROW.use(playerUnit, { x, y });
          }
        } else if (modifiers.includes('ALT')) {
          if (playerUnit.canSpendMana(UnitAbility.STRAFE.manaCost)) {
            queuedOrder = () => UnitAbility.STRAFE.use(playerUnit, { x, y });
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
        const playerController = playerUnit.getController() as PlayerUnitController;
        if (queuedOrder) {
          playerController.queuedOrder = queuedOrder;
          await this.engine.playTurn();
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

  private _handleEnter = async (modifiers: ModifierKey[]) => {
    const state = GameState.getInstance();
    const playerUnit = state.getPlayerUnit();

    if (modifiers.includes('ALT')) {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
          document.body.classList.remove('fullscreen');
        } else {
          await document.documentElement.requestFullscreen();
          document.body.classList.add('fullscreen');
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }

    switch (state.getScreen()) {
      case 'GAME': {
        const map = checkNotNull(state.getMap(), 'Map is not loaded!');
        const { x, y } = playerUnit.getCoordinates();
        const item = map.getItem({ x, y });
        if (item) {
          pickupItem(playerUnit, item);
          map.removeItem({ x, y });
        } else if (map.getTile({ x, y }).type === 'STAIRS_DOWN') {
          playSound(Sounds.DESCEND_STAIRS);
          await loadNextMap();
        }
        await this.engine.playTurn();
        break;
      }
      case 'INVENTORY': {
        const playerUnit = state.getPlayerUnit();
        const { selectedItem } = playerUnit.getInventory();

        if (selectedItem) {
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
      case 'GAME_OVER': {
        const gameDriver = GameDriver.getInstance();
        const state = await gameDriver.initState();
        const renderer = gameDriver.getRenderer();
        await initialize(state, renderer);
      }
    }
  };

  private _handleTab = async () => {
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

  private _handleMap = async () => {
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

  private _handleAbility = async (command: NumberKey) => {
    const state = GameState.getInstance();
    const playerUnit = state.getPlayerUnit();

    // sketchy - player abilities are indexed as (0 => attack, others => specials)
    const index = parseInt(command.toString());
    const ability = playerUnit.getAbilities()
      .filter(ability => ability.icon !== null)
      [index - 1];
    if (ability && playerUnit.canSpendMana(ability.manaCost)) {
      state.setQueuedAbility(ability);
      await render();
    }
  };

  private _handleF1 = async () => {
    const state = GameState.getInstance();
    if (['GAME', 'INVENTORY', 'MINIMAP'].includes(state.getScreen())) {
      state.setScreen('HELP');
    } else {
      state.showPrevScreen();
    }
    await render();
  };

  private _getDirection = (key: ArrowKey): Direction => {
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

  attachEvents = (target: HTMLElement) => {
    // const canvas = document.querySelector('#container canvas') as HTMLCanvasElement;
    target.addEventListener('keydown', this.keyHandlerWrapper);
  };
}
