import { injectable } from 'inversify';

type Handler<E> = (event: E) => Promise<void>;
type KeyHandler = (event: KeyboardEvent) => Promise<void>;
type TouchHandler = (event: TouchEvent) => Promise<void>;

type Props = Readonly<{
  onKeyDown: KeyHandler;
  onKeyUp: KeyHandler;
  onTouchDown: TouchHandler;
}>;

@injectable()
export default class InputHandler {
  private readonly keyDownHandler: KeyHandler;
  private readonly keyUpHandler: KeyHandler;
  private readonly touchDownHandler: TouchHandler;
  private busy: boolean;
  private eventTarget: HTMLElement | null;
  private _onKeyDown: KeyHandler | null = null;
  private _onKeyUp: KeyHandler | null = null;
  private _onTouchDown: TouchHandler | null = null;

  constructor({ onKeyDown, onKeyUp, onTouchDown }: Props) {
    this.keyDownHandler = onKeyDown;
    this.keyUpHandler = onKeyUp;
    this.touchDownHandler = onTouchDown;
    this.busy = false;
    this.eventTarget = null;
  }

  private _wrapHandler = <E>(handler: Handler<E>): Handler<E> => {
    return async (event: E) => {
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
    this._onKeyDown = this._wrapHandler(this.keyDownHandler);
    this._onKeyUp = this.keyUpHandler;
    this._onTouchDown = this._wrapHandler(this.touchDownHandler);

    target.addEventListener('keydown', this._onKeyDown);
    target.addEventListener('keyup', this._onKeyUp);
    target.addEventListener('touchstart', this._onTouchDown);
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
