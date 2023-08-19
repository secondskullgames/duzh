import GameState from '../core/GameState';
import type { KeyCommand } from './inputTypes';
import { mapToCommand } from './inputMappers';
import { ScreenInputHandler } from './screens/ScreenInputHandler';
import GameScreenInputHandler from './screens/GameScreenInputHandler';
import InventoryScreenInputHandler from './screens/InventoryScreenInputHandler';
import TitleScreenInputHandler from './screens/TitleScreenInputHandler';
import CharacterScreenInputHandler from './screens/CharacterScreenInputHandler';
import GameOverScreenInputHandler from './screens/GameOverScreenInputHandler';
import MapScreenInputHandler from './screens/MapScreenInputHandler';
import VictoryScreenInputHandler from './screens/VictoryScreenInputHandler';
import HelpScreenInputHandler from './screens/HelpScreenInputHandler';
import { checkNotNull } from '../utils/preconditions';
import { GameScreen } from '../core/GameScreen';
import LevelUpScreenInputHandler from './screens/LevelUpScreenInputHandler';
import Ticker from '../core/Ticker';
import MapFactory from '../maps/MapFactory';

const screenHandlers: Record<GameScreen, ScreenInputHandler> = {
  [GameScreen.NONE]:      { handleKeyCommand: async () => {} },
  [GameScreen.CHARACTER]: CharacterScreenInputHandler,
  [GameScreen.GAME]:      GameScreenInputHandler,
  [GameScreen.GAME_OVER]: GameOverScreenInputHandler,
  [GameScreen.HELP]:      HelpScreenInputHandler,
  [GameScreen.INVENTORY]: InventoryScreenInputHandler,
  [GameScreen.LEVEL_UP]:  LevelUpScreenInputHandler,
  [GameScreen.MAP]:       MapScreenInputHandler,
  [GameScreen.TITLE]:     TitleScreenInputHandler,
  [GameScreen.VICTORY]:   VictoryScreenInputHandler
};

type Props = Readonly<{
  state: GameState,
  mapFactory: MapFactory,
  ticker: Ticker
}>;

export default class InputHandler {
  private readonly state: GameState;
  private readonly mapFactory: MapFactory;
  private readonly ticker: Ticker;

  private busy: boolean;
  private eventTarget: HTMLElement | null;
  private _onKeyDown: ((e: KeyboardEvent) => Promise<void>) | null = null;
  private _onKeyUp: ((e: KeyboardEvent) => Promise<void>) | null = null;

  constructor({ state, mapFactory, ticker }: Props) {
    this.state = state;
    this.mapFactory = mapFactory;
    this.ticker = ticker;
    this.busy = false;
    this.eventTarget = null;
  }

  keyHandlerWrapper = async (event: KeyboardEvent) => {
    if (!this.busy) {
      this.busy = true;
      try {
        await this.keyHandler(event);
      } catch (e) {
        console.error(e);
        alert(e);
      }
      this.busy = false;
    }
  };

  keyHandler = async (event: KeyboardEvent) => {
    const command: (KeyCommand | null) = mapToCommand(event);

    if (!command) {
      return;
    }

    event.preventDefault();

    await this._handleKeyCommand(command);
  };

  private _handleKeyCommand = async (command: KeyCommand) => {
    const { state, mapFactory, ticker } = this;
    const handler: ScreenInputHandler = checkNotNull(screenHandlers[state.getScreen()]);
    await handler.handleKeyCommand(command, { state, mapFactory, ticker });
  };

  addEventListener = (target: HTMLElement) => {
    this._onKeyDown = (e: KeyboardEvent) => this.keyHandlerWrapper(e);
    this._onKeyUp = async (e: KeyboardEvent) => {
      const command: (KeyCommand | null) = mapToCommand(e);
    }

    target.addEventListener('keydown', this._onKeyDown);
    target.addEventListener('keyup', this._onKeyUp);
    this.eventTarget = target;
  };

  removeEventListener = () => {
    if (this._onKeyDown) {
      this.eventTarget?.removeEventListener('keydown', this._onKeyDown);
    }
    if (this._onKeyUp) {
      this.eventTarget?.removeEventListener('keyup', this._onKeyUp);
    }
  };
}
