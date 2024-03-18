import { injectable } from 'inversify';

type KeyHandler = (event: KeyboardEvent) => Promise<void>;

type Props = Readonly<{
  onKeyDown: KeyHandler;
  onKeyUp: KeyHandler;
}>;

@injectable()
export default class InputHandler {
  private readonly keyDownHandler: KeyHandler;
  private readonly keyUpHandler: KeyHandler;
  private busy: boolean;
  private eventTarget: HTMLElement | null;
  private _onKeyDown: KeyHandler | null = null;
  private _onKeyUp: KeyHandler | null = null;

  constructor({ onKeyDown, onKeyUp }: Props) {
    this.keyDownHandler = onKeyDown;
    this.keyUpHandler = onKeyUp;
    this.busy = false;
    this.eventTarget = null;
  }

  private _wrapKeyHandler = (handler: KeyHandler): KeyHandler => {
    return async (event: KeyboardEvent) => {
      if (!this.busy) {
        this.busy = true;
        try {
          await handler(event);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
          // eslint-disable-next-line no-alert
          alert(e);
        }
        this.busy = false;
      }
    };
  };

  addEventListener = (target: HTMLElement) => {
    this._onKeyDown = this._wrapKeyHandler(this.keyDownHandler);
    this._onKeyUp = this.keyUpHandler;

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
