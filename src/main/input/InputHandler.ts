import GameState from '../core/GameState';
import type { KeyCommand } from './inputTypes';
import { mapToCommand } from './inputMappers';
import GameRenderer from '../graphics/renderers/GameRenderer';
import { GameScreen } from '../types/types';
import ImageFactory from '../graphics/images/ImageFactory';
import GameScreenInputHandler from './screens/GameScreenInputHandler';
import InventoryScreenInputHandler from './screens/InventoryScreenInputHandler';
import TitleScreenInputHandler from './screens/TitleScreenInputHandler';
import InputHandlerType from './screens/InputHandlerType';
import GameOverScreenInputHandler from './screens/GameOverScreenInputHandler';
import MapScreenInputHandler from './screens/MapScreenInputHandler';
import VictoryScreenInputHandler from './screens/VictoryScreenInputHandler';
import HelpScreenInputHandler from './screens/HelpScreenInputHandler';
import { checkNotNull } from '../utils/preconditions';

const screenHandlers: Record<GameScreen, InputHandlerType> = {
  [GameScreen.GAME]:      GameScreenInputHandler,
  [GameScreen.GAME_OVER]: GameOverScreenInputHandler,
  [GameScreen.HELP]:      HelpScreenInputHandler,
  [GameScreen.INVENTORY]: InventoryScreenInputHandler,
  [GameScreen.MAP]:       MapScreenInputHandler,
  [GameScreen.TITLE]:     TitleScreenInputHandler,
  [GameScreen.VICTORY]:   VictoryScreenInputHandler
};

export default class InputHandler {
  private busy: boolean;
  private eventTarget: HTMLElement | null;

  constructor() {
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

    const state = GameState.getInstance();
    const renderer = GameRenderer.getInstance();
    const imageFactory = ImageFactory.getInstance();
    const handler: InputHandlerType = checkNotNull(screenHandlers[state.getScreen()]);
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
