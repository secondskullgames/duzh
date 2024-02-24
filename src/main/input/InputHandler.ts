import { mapToCommand } from './inputMappers';
import { ScreenInputHandler } from './screens/ScreenInputHandler';
import ScreenHandlers from './screens/ScreenHandlers';
import { Session } from '../core/Session';
import { inject, injectable } from 'inversify';
import type { KeyCommand } from './inputTypes';

@injectable()
export default class InputHandler {
  private busy: boolean;
  private eventTarget: HTMLElement | null;
  private _onKeyDown: ((e: KeyboardEvent) => Promise<void>) | null = null;
  private _onKeyUp: ((e: KeyboardEvent) => Promise<void>) | null = null;

  constructor(
    @inject(Session.SYMBOL)
    private readonly session: Session,
    @inject(ScreenHandlers)
    private readonly screenHandlers: ScreenHandlers
  ) {
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
    const { session } = this;
    const handler: ScreenInputHandler = this.screenHandlers.getHandler(
      session.getScreen()
    );
    await handler.handleKeyCommand(command);
  };

  addEventListener = (target: HTMLElement) => {
    this._onKeyDown = (e: KeyboardEvent) => this.keyHandlerWrapper(e);
    this._onKeyUp = async () => {};

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
