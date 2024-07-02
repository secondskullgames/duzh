import { Pixel } from '@lib/geometry/Pixel';

export type ArrowKey = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type NumberKey = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0';
export type FunctionKey =
  | 'F1'
  | 'F2'
  | 'F3'
  | 'F4'
  | 'F5'
  | 'F6'
  | 'F7'
  | 'F8'
  | 'F9'
  | 'F10'
  | 'F11'
  | 'F12';
/**
 * OTHER is a special command (read: hack) that does nothing, but is a trigger to call preventDefault()
 */
export type Key =
  | ArrowKey
  | NumberKey
  | FunctionKey
  | 'ALT'
  | 'CTRL'
  | 'SHIFT'
  | 'TAB'
  | 'ENTER'
  | 'SPACEBAR'
  | 'ESCAPE'
  | 'C'
  | 'L'
  | 'M'
  | 'OTHER';

export enum ModifierKey {
  ALT = 'ALT',
  CTRL = 'CTRL',
  SHIFT = 'SHIFT'
}

export type KeyCommand = Readonly<{
  key: Key;
  modifiers: ModifierKey[];
}>;

export type ClickCommand = Readonly<{
  pixel: Pixel;
}>;

export type Handler<E> = (event: E) => Promise<void>;
export type KeyHandler = Handler<KeyboardEvent>;
export type ClickHandler = Handler<MouseEvent>;
export type TouchHandler = Handler<TouchEvent>;
