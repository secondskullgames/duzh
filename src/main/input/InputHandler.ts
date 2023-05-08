import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import Coordinates from '../geometry/Coordinates';
import PlayerUnitController from '../entities/units/controllers/PlayerUnitController';
import { toggleFullScreen } from '../utils/dom';
import { checkNotNull } from '../utils/preconditions';
import GameState from '../core/GameState';
import type { ArrowKey, KeyCommand, ModifierKey, NumberKey } from './inputTypes';
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
import GameScreenInputHandler from './screens/GameScreenInputHandler';
import InventoryScreenInputHandler from './screens/InventoryScreenInputHandler';
import TitleScreenInputHandler from './screens/TitleScreenInputHandler';
import InputHandlerType from './screens/InputHandlerType';
import GameOverScreenInputHandler from './screens/GameOverScreenInputHandler';
import MapScreenInputHandler from './screens/MapScreenInputHandler';
import VictoryScreenInputHandler from './screens/VictoryScreenInputHandler';
import HelpScreenInputHandler from './screens/HelpScreenInputHandler';

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

    const state = this.state;
    const renderer = GameRenderer.getInstance();
    const imageFactory = ImageFactory.getInstance();
    const handler: InputHandlerType = (() => {
      switch (this.state.getScreen()) {
        case GameScreen.GAME:
          return GameScreenInputHandler;
        case GameScreen.GAME_OVER:
          return GameOverScreenInputHandler;
        case GameScreen.HELP:
          return HelpScreenInputHandler;
        case GameScreen.INVENTORY:
          return InventoryScreenInputHandler;
        case GameScreen.MAP:
          return MapScreenInputHandler;
        case GameScreen.TITLE:
          return TitleScreenInputHandler;
        case GameScreen.VICTORY:
          return VictoryScreenInputHandler;
      }
    })();
    await handler.handleKeyCommand(command, { state, renderer, imageFactory });
  };

  addEventListener = (target: HTMLElement) => {
    target.addEventListener('keydown', this.keyHandlerWrapper);
    this.eventTarget = target;
  };

  removeEventListener = () => {
    this.eventTarget?.removeEventListener('keydown', this.keyHandlerWrapper);
  };
}
