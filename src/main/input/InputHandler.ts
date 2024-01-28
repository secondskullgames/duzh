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
import LevelUpScreenInputHandler from './screens/LevelUpScreenInputHandler';
import InventoryV2InputHandler from './screens/InventoryV2InputHandler';
import { checkNotNull } from '../utils/preconditions';
import { GameScreen } from '../core/GameScreen';
import { GameState } from '../core/GameState';
import MapFactory from '../maps/MapFactory';
import { Session } from '../core/Session';
import { Feature } from '../utils/features';
import type { KeyCommand } from './inputTypes';

const screenHandlers: Record<GameScreen, ScreenInputHandler> = {
  [GameScreen.NONE]: { handleKeyCommand: async () => {} },
  [GameScreen.CHARACTER]: CharacterScreenInputHandler,
  [GameScreen.GAME]: GameScreenInputHandler,
  [GameScreen.GAME_OVER]: GameOverScreenInputHandler,
  [GameScreen.HELP]: HelpScreenInputHandler,
  [GameScreen.INVENTORY]: Feature.isEnabled(Feature.INVENTORY_V2)
    ? InventoryV2InputHandler
    : InventoryScreenInputHandler,
  [GameScreen.LEVEL_UP]: LevelUpScreenInputHandler,
  [GameScreen.MAP]: MapScreenInputHandler,
  [GameScreen.TITLE]: TitleScreenInputHandler,
  [GameScreen.VICTORY]: VictoryScreenInputHandler
};

type Props = Readonly<{
  state: GameState;
  session: Session;
  mapFactory: MapFactory;
}>;

export default class InputHandler {
  private readonly state: GameState;
  private readonly session: Session;
  private readonly mapFactory: MapFactory;

  private busy: boolean;
  private eventTarget: HTMLElement | null;
  private _onKeyDown: ((e: KeyboardEvent) => Promise<void>) | null = null;
  private _onKeyUp: ((e: KeyboardEvent) => Promise<void>) | null = null;

  constructor({ state, session, mapFactory }: Props) {
    this.state = state;
    this.session = session;
    this.mapFactory = mapFactory;
    this.busy = false;
    this.eventTarget = null;
  }

  keyHandlerWrapper = async (event: KeyboardEvent) => {
    if (!this.busy) {
      this.busy = true;
      try {
        await this.keyHandler(event);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        // eslint-disable-next-line no-alert
        alert(e);
      }
      this.busy = false;
    }
  };

  keyHandler = async (event: KeyboardEvent) => {
    const command: KeyCommand | null = mapToCommand(event);

    if (!command) {
      return;
    }

    event.preventDefault();

    await this._handleKeyCommand(command);
  };

  private _handleKeyCommand = async (command: KeyCommand) => {
    const { state, session, mapFactory } = this;
    const handler: ScreenInputHandler = checkNotNull(screenHandlers[session.getScreen()]);
    await handler.handleKeyCommand(command, {
      state,
      session,
      mapFactory
    });
  };

  addEventListener = (target: HTMLElement) => {
    this._onKeyDown = (e: KeyboardEvent) => this.keyHandlerWrapper(e);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this._onKeyUp = async (e: KeyboardEvent) => {};

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
