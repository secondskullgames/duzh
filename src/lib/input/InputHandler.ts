import { injectable } from 'inversify';

type KeyHandler = (event: KeyboardEvent) => Promise<void>;

type Props = Readonly<{
  keyHandler: KeyHandler;
}>;

@injectable()
export default class InputHandler {
  private readonly keyHandler: KeyHandler;
  private busy: boolean;
  private eventTarget: HTMLElement | null;
  private _onKeyDown: KeyHandler | null = null;
  private _onKeyUp: KeyHandler | null = null;

  constructor({ keyHandler }: Props) {
    this.keyHandler = keyHandler;
    this.busy = false;
    this.eventTarget = null;
  }

  keyHandlerWrapper = async (event: KeyboardEvent) => {
    event.preventDefault();
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
