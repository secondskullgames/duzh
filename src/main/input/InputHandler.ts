import GameState from '../core/GameState';
import type { KeyCommand } from './inputTypes';
import { mapToCommand } from './inputMappers';
import GameRenderer from '../graphics/renderers/GameRenderer';
import { GameScreen } from '../types/types';
import ImageFactory from '../graphics/images/ImageFactory';
import GameScreenInputHandler from './screens/GameScreenInputHandler';
import InventoryScreenInputHandler from './screens/InventoryScreenInputHandler';
import TitleScreenInputHandler from './screens/TitleScreenInputHandler';
import ScreenHandler from './screens/ScreenHandler';
import GameOverScreenInputHandler from './screens/GameOverScreenInputHandler';
import MapScreenInputHandler from './screens/MapScreenInputHandler';
import VictoryScreenInputHandler from './screens/VictoryScreenInputHandler';
import HelpScreenInputHandler from './screens/HelpScreenInputHandler';
import { checkNotNull } from '../utils/preconditions';

const screenHandlers: Record<GameScreen, ScreenHandler> = {
  [GameScreen.GAME]:      GameScreenInputHandler,
  [GameScreen.GAME_OVER]: GameOverScreenInputHandler,
  [GameScreen.HELP]:      HelpScreenInputHandler,
  [GameScreen.INVENTORY]: InventoryScreenInputHandler,
  [GameScreen.MAP]:       MapScreenInputHandler,
  [GameScreen.TITLE]:     TitleScreenInputHandler,
  [GameScreen.VICTORY]:   VictoryScreenInputHandler
};

type Props = Readonly<{
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

  keyHandlerWrapper = async (event: KeyboardEvent, props: Props) => {
    if (!this.busy) {
      this.busy = true;
      try {
        await this.keyHandler(event, props)
      } catch (e) {
        console.error(e);
        alert(e);
      }
      this.busy = false;
    }
  };

  keyHandler = async (e: KeyboardEvent, props: Props) => {
    if (e.repeat) {
      return;
    }

    const command : (KeyCommand | null) = mapToCommand(e);

    if (!command) {
      return;
    }

    e.preventDefault();

    const { state, renderer, imageFactory } = props;
    const handler: ScreenHandler = checkNotNull(screenHandlers[state.getScreen()]);
    await handler.handleKeyCommand(command, { state, renderer, imageFactory });
  };

  addEventListener = (target: HTMLElement, props: Props) => {
    boundHandler = (e: KeyboardEvent) => this.keyHandlerWrapper(e, props);
    target.addEventListener('keydown', boundHandler);
    this.eventTarget = target;
  };

  removeEventListener = () => {
    if (boundHandler) {
      this.eventTarget?.removeEventListener('keydown', boundHandler);
    }
  };
}
