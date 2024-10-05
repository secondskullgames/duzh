import { ClickHandler, Handler, KeyHandler, TouchHandler } from '@lib/input/inputTypes';
import { injectable } from 'inversify';

type Props = Readonly<{
  onKeyDown: KeyHandler;
  onKeyUp: KeyHandler;
  onClick: ClickHandler;
  onTouchDown: TouchHandler;
}>;

@injectable()
export default class InputHandler {
  private readonly keyDownHandler: KeyHandler;
  private readonly keyUpHandler: KeyHandler;
  private readonly clickHandler: ClickHandler;
  private readonly touchHandler: TouchHandler;
  private busy: boolean;
  private eventTarget: HTMLElement | null;
  private _onKeyDown: KeyHandler | null = null;
  private _onKeyUp: KeyHandler | null = null;
  private _onClick: ClickHandler | null = null;
  private _onTouch: TouchHandler | null = null;

  constructor({ onKeyDown, onKeyUp, onClick, onTouchDown }: Props) {
    this.keyDownHandler = onKeyDown;
    this.keyUpHandler = onKeyUp;
    this.clickHandler = onClick;
    this.touchHandler = onTouchDown;
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
          console.error(e);
          alert(e);
        }
        this.busy = false;
      }
    };
  };

  addEventListener = (target: HTMLElement) => {
    this._onKeyDown = this._wrapHandler(this.keyDownHandler);
    this._onKeyUp = this.keyUpHandler;
    this._onClick = this._wrapHandler(this.clickHandler);
    this._onTouch = this._wrapHandler(this.touchHandler);

    target.addEventListener('keydown', this._onKeyDown);
    target.addEventListener('keyup', this._onKeyUp);
    target.addEventListener('click', this._onClick);
    target.addEventListener('touchstart', this._onTouch);
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
