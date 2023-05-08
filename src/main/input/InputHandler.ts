import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import Coordinates from '../geometry/Coordinates';
import PlayerUnitController from '../entities/units/controllers/PlayerUnitController';
import { toggleFullScreen } from '../utils/dom';
import { checkNotNull } from '../utils/preconditions';
import GameState from '../core/GameState';
import { ArrowKey, KeyCommand, ModifierKey, NumberKey } from './inputTypes';
import { getDirection, mapToCommand } from './inputMappers';
import MapFactory from '../maps/MapFactory';
import GameRenderer from '../graphics/renderers/GameRenderer';
import { GameScreen } from '../types/types';
import { playTurn } from '../actions/playTurn';
import { showSplashScreen } from '../actions/showSplashScreen';
import { loadNextMap } from '../actions/loadNextMap';
import { startGame } from '../actions/startGame';
import { startGameDebug } from '../actions/startGameDebug';
import { pickupItem } from '../actions/pickupItem';
import { useItem } from '../actions/useItem';
import { ShootArrow } from '../entities/units/abilities/ShootArrow';
import { Strafe } from '../entities/units/abilities/Strafe';
import { NormalAttack } from '../entities/units/abilities/NormalAttack';
import ImageFactory from '../graphics/images/ImageFactory';

type PromiseSupplier = () => Promise<void>;

type Props = Readonly<{
  state: GameState
}>;

export default class InputHandler {
  private readonly state: GameState;

  private busy: boolean;
  private eventTarget: HTMLElement | null;

  constructor({ state }: Props) {
    this.state = state;

    this.busy = false;
    this.eventTarget = null;
  }

  keyHandlerWrapper = async (event: KeyboardEvent) => {
    if (!this.busy) {
      this.busy = true;
      try {
        await this.keyHandler(event)
      } catch (e) {
        console.error(e);
        alert(e);
      }
      this.busy = false;
    }
  };

  keyHandler = async (e: KeyboardEvent) => {
    if (e.repeat) {
      return;
    }

    const command : (KeyCommand | null) = mapToCommand(e);

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
        await playTurn({
          state: this.state,
          renderer: GameRenderer.getInstance(),
          imageFactory: ImageFactory.getInstance()
        });
        break;
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
    const { state } = this;
    const renderer = GameRenderer.getInstance();
    const imageFactory = ImageFactory.getInstance();

    switch (state.getScreen()) {
      case 'GAME':
        const direction = getDirection(key);
        const playerUnit = state.getPlayerUnit();
        const coordinates = Coordinates.plus(playerUnit.getCoordinates(), direction);

        let queuedOrder: PromiseSupplier | null = null;
        if (modifiers.includes('SHIFT')) {
          if (playerUnit.getEquipment().getBySlot('RANGED_WEAPON') && playerUnit.canSpendMana(ShootArrow.manaCost)) {
            queuedOrder = () => ShootArrow.use(
              playerUnit,
              coordinates,
              { state, renderer, imageFactory }
            );
          }
        } else if (modifiers.includes('ALT')) {
          if (playerUnit.canSpendMana(Strafe.manaCost)) {
            queuedOrder = () => Strafe.use(
              playerUnit,
              coordinates,
              { state, renderer, imageFactory }
            );
          }
        } else {
          const ability = state.getQueuedAbility();
          if (ability !== null) {
            queuedOrder = async () => {
              state.setQueuedAbility(null);
              await ability.use(
                playerUnit,
                coordinates,
                { state, renderer, imageFactory }
              );
            };
          } else {
            queuedOrder = () => NormalAttack.use(
              playerUnit,
              coordinates,
              { state, renderer, imageFactory }
            );
          }
        }
        const playerController = playerUnit.getController() as PlayerUnitController;
        if (queuedOrder) {
          playerController.queuedOrder = queuedOrder;
          await playTurn({ state, renderer, imageFactory });
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
        await renderer.render();
        break;
      default:
        break;
    }
  };

  private _handleEnter = async (modifiers: ModifierKey[]) => {
    const { state } = this;
    const renderer = GameRenderer.getInstance();
    const imageFactory = ImageFactory.getInstance();
    const playerUnit = state.getPlayerUnit();

    if (modifiers.includes('ALT')) {
      try {
        await toggleFullScreen();
      } catch (e) {
        console.error(e);
      }
      return;
    }

    switch (state.getScreen()) {
      case GameScreen.GAME: {
        const map = checkNotNull(state.getMap(), 'Map is not loaded!');
        const coordinates = playerUnit.getCoordinates();
        const item = map.getItem(coordinates);
        if (item) {
          pickupItem(playerUnit, item, { state });
          map.removeObject(item);
        } else if (map.getTile(coordinates).getTileType() === 'STAIRS_DOWN') {
          playSound(Sounds.DESCEND_STAIRS);
          await loadNextMap({ state, renderer });
        }
        await playTurn({ state, renderer, imageFactory });
        break;
      }
      case GameScreen.INVENTORY: {
        const playerUnit = state.getPlayerUnit();
        const { selectedItem } = playerUnit.getInventory();

        if (selectedItem) {
          state.setScreen(GameScreen.GAME);
          await useItem(playerUnit, selectedItem);
          await renderer.render();
        }
        break;
      }
      case GameScreen.TITLE:
        state.setScreen(GameScreen.GAME);
        if (modifiers.includes('SHIFT')) {
          const mapInstance = await MapFactory.loadMap(
            { type: 'predefined', id: 'test' },
            { state, imageFactory }
          );
          await startGameDebug(mapInstance, {
            state,
            renderer
          });
        } else {
          await startGame({
            state,
            renderer
          });
        }
        break;
      case GameScreen.VICTORY:
      case GameScreen.GAME_OVER: {
        await showSplashScreen({
          state,
          renderer
        });
      }
    }
  };

  private _handleTab = async () => {
    const { state } = this;
    const renderer = GameRenderer.getInstance();

    switch (state.getScreen()) {
      case GameScreen.INVENTORY:
        state.setScreen(GameScreen.GAME);
        break;
      default:
        state.setScreen(GameScreen.INVENTORY);
        break;
    }
    await renderer.render();
  };

  private _handleMap = async () => {
    const { state } = this;

    switch (state.getScreen()) {
      case GameScreen.MAP:
        state.setScreen(GameScreen.GAME);
        break;
      case GameScreen.GAME:
      case GameScreen.INVENTORY:
        state.setScreen(GameScreen.MAP);
        break;
      default:
        break;
    }
    await GameRenderer.getInstance().render();
  };

  private _handleAbility = async (command: NumberKey) => {
    const { state } = this;
    const renderer = GameRenderer.getInstance();
    const playerUnit = state.getPlayerUnit();

    // sketchy - player abilities are indexed as (0 => attack, others => specials)
    const index = parseInt(command.toString());
    const ability = playerUnit.getAbilities()
      .filter(ability => ability.icon !== null)
      [index - 1];
    if (ability && playerUnit.canSpendMana(ability.manaCost)) {
      state.setQueuedAbility(ability);
      await renderer.render();
    }
  };

  private _handleF1 = async () => {
    const { state } = this;
    const renderer = GameRenderer.getInstance();

    if ([GameScreen.GAME, GameScreen.INVENTORY, GameScreen.MAP].includes(state.getScreen())) {
      state.setScreen(GameScreen.HELP);
    } else {
      state.showPrevScreen();
    }
    await renderer.render();
  };

  addEventListener = (target: HTMLElement) => {
    target.addEventListener('keydown', this.keyHandlerWrapper);
    this.eventTarget = target;
  };

  removeEventListener = () => {
    this.eventTarget?.removeEventListener('keydown', this.keyHandlerWrapper);
  };
}
