import TurnHandler from './TurnHandler';
import Sounds from '../sounds/Sounds';
import Unit from '../units/Unit';
import { pickupItem, useItem } from '../items/ItemUtils';
import { resolvedPromise } from '../utils/PromiseUtils';
import { playSound } from '../sounds/SoundFX';
import { loadMap, restartGame, startGame } from './actions';
import { Coordinates, GameScreen, TileType } from '../types/types';
import UnitAbilities, { Ability } from '../units/UnitAbilities';

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
  KEY_2 = '2'
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
    case 'm':
    case 'M':
      return KeyCommand.M;
    case '1':
      return KeyCommand.KEY_1;
    case '2':
      return KeyCommand.KEY_2;
  }
  return null;
}

// global state

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
    case KeyCommand.M:
      return _handleMap();
    case KeyCommand.KEY_1:
    case KeyCommand.KEY_2:
      return _handleAbility(command);
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
            return (u: Unit) => UnitAbilities.SHOOT_ARROW.use(u, { dx, dy });
          default:
            if (!!jwb.state.queuedAbility) {
              const ability = jwb.state.queuedAbility;
              jwb.state.queuedAbility = null;
              return (u: Unit) => ability.use(u, { dx, dy });
            }
            return (u: Unit) => UnitAbilities.ATTACK.use(u, { dx, dy });
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
    case GameScreen.MINIMAP:
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
      state.screen = GameScreen.GAME;
      return startGame();
    case GameScreen.VICTORY:
    case GameScreen.GAME_OVER:
      state.screen = GameScreen.GAME;
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

function _handleMap(): Promise<void> {
  const { state, renderer } = jwb;

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
  return renderer.render();
}

function _handleAbility(command: KeyCommand): Promise<void> {
  const { renderer } = jwb;
  const { playerUnit } = jwb.state;
  switch (command) {
    case KeyCommand.KEY_1:
      if (playerUnit.getCooldown(UnitAbilities.HEAVY_ATTACK) <= 0) {
        jwb.state.queuedAbility = UnitAbilities.HEAVY_ATTACK;
        return renderer.render();
      } else {
        console.log(`HEAVY_ATTACK is on cooldown: ${playerUnit.getCooldown(UnitAbilities.HEAVY_ATTACK)}`);
      }
      break;
    case KeyCommand.KEY_2:
      if (playerUnit.getCooldown(UnitAbilities.KNOCKBACK_ATTACK) <= 0) {
        jwb.state.queuedAbility = UnitAbilities.KNOCKBACK_ATTACK;
        return renderer.render();
      } else {
        console.log(`KNOCKBACK_ATTACK is on cooldown: ${playerUnit.getCooldown(UnitAbilities.KNOCKBACK_ATTACK)}`);
      }
      break;
  }
  return resolvedPromise();
}

function attachEvents() {
  window.onkeydown = keyHandlerWrapper;
}

export {
  attachEvents,
  keyHandler as simulateKeyPress
};
