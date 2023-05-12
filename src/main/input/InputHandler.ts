import GameState from '../core/GameState';
import type { KeyCommand } from './inputTypes';
import { mapToCommand } from './inputMappers';
import GameRenderer from '../graphics/renderers/GameRenderer';
import { GameScreen } from '../types/types';
import ImageFactory from '../graphics/images/ImageFactory';
import GameScreenInputHandler from './screens/GameScreenInputHandler';
import InventoryScreenInputHandler from './screens/InventoryScreenInputHandler';
import TitleScreenInputHandler from './screens/TitleScreenInputHandler';
import ScreenInputHandler from './screens/ScreenInputHandler';
import GameOverScreenInputHandler from './screens/GameOverScreenInputHandler';
import MapScreenInputHandler from './screens/MapScreenInputHandler';
import VictoryScreenInputHandler from './screens/VictoryScreenInputHandler';
import HelpScreenInputHandler from './screens/HelpScreenInputHandler';
import { checkNotNull } from '../utils/preconditions';

const screenHandlers: Record<GameScreen, ScreenInputHandler> = {
  [GameScreen.GAME]:      GameScreenInputHandler,
  [GameScreen.GAME_OVER]: GameOverScreenInputHandler,
  [GameScreen.HELP]:      HelpScreenInputHandler,
  [GameScreen.INVENTORY]: InventoryScreenInputHandler,
  [GameScreen.MAP]:       MapScreenInputHandler,
  [GameScreen.TITLE]:     TitleScreenInputHandler,
  [GameScreen.VICTORY]:   VictoryScreenInputHandler
};

type Context = Readonly<{
  state: GameState,
  renderer: GameRenderer,
  imageFactory: ImageFactory
}>;

let boundHandler: ((e: KeyboardEvent) => Promise<void>) | null = null;

export default class InputHandler {
  private busy: boolean;
  private eventTarget: HTMLElement | null;

  constructor() {
    this.busy = false;
    this.eventTarget = null;
  }

  keyHandlerWrapper = async (
    event: KeyboardEvent,
    { state, renderer, imageFactory }: Context
  ) => {
    if (!this.busy) {
      this.busy = true;
      try {
        await this.keyHandler(event, { state, renderer, imageFactory })
      } catch (e) {
        console.error(e);
        alert(e);
      }
      this.busy = false;
    }
  };

  keyHandler = async (
    e: KeyboardEvent,
    { state, renderer, imageFactory }: Context
  ) => {
    if (e.repeat) {
      return;
    }

    const command : (KeyCommand | null) = mapToCommand(e);

    if (!command) {
      return;
    }

    e.preventDefault();

    const handler: ScreenInputHandler = checkNotNull(screenHandlers[state.getScreen()]);
    await handler.handleKeyCommand(command, { state, renderer, imageFactory });
  };

  addEventListener = (target: HTMLElement, context: Context) => {
    boundHandler = (e: KeyboardEvent) => this.keyHandlerWrapper(e, context);
    target.addEventListener('keydown', boundHandler);
    this.eventTarget = target;
  };

  removeEventListener = () => {
    if (boundHandler) {
      this.eventTarget?.removeEventListener('keydown', boundHandler);
    }
  };
}
