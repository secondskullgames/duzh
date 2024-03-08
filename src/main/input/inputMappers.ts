import Direction from '../geometry/Direction';
import { ArrowKey, KeyCommand, ModifierKey } from '@lib/input/inputTypes';

export const mapToCommand = (e: KeyboardEvent): KeyCommand | null => {
  const modifiers = [
    e.altKey && 'ALT',
    e.shiftKey && 'SHIFT',
    (e.ctrlKey || e.metaKey) && 'CTRL'
  ]
    .filter(x => x)
    .map(x => x as ModifierKey);

  switch (e.code) {
    case 'KeyW':
    case 'ArrowUp':
      return { key: 'UP', modifiers };
    case 'KeyS':
    case 'ArrowDown':
      return { key: 'DOWN', modifiers };
    case 'KeyA':
    case 'ArrowLeft':
      return { key: 'LEFT', modifiers };
    case 'KeyD':
    case 'ArrowRight':
      return { key: 'RIGHT', modifiers };
    case 'Tab':
      return { key: 'TAB', modifiers };
    case 'Enter':
    case 'NumpadEnter':
      return { key: 'ENTER', modifiers };
    case 'Space':
      return { key: 'SPACEBAR', modifiers };
    case 'Escape':
      return { key: 'ESCAPE', modifiers };
    case 'KeyC':
      return { key: 'C', modifiers };
    case 'KeyL':
      return { key: 'L', modifiers };
    case 'KeyM':
      return { key: 'M', modifiers };
    case 'Digit1':
      return { key: '1', modifiers };
    case 'Digit2':
      return { key: '2', modifiers };
    case 'Digit3':
      return { key: '3', modifiers };
    case 'Digit4':
      return { key: '4', modifiers };
    case 'Digit5':
      return { key: '5', modifiers };
    case 'Digit6':
      return { key: '6', modifiers };
    case 'Digit7':
      return { key: '7', modifiers };
    case 'Digit8':
      return { key: '8', modifiers };
    case 'Digit9':
      return { key: '9', modifiers };
    case 'F1':
      return { key: 'F1', modifiers };
    case 'AltLeft':
    case 'AltRight':
    case 'ShiftLeft':
    case 'ShiftRight':
    case 'ControlLeft':
    case 'ControlRight':
    case 'OSLeft':
    case 'OSRight':
      return { key: 'OTHER', modifiers };
  }

  return null;
};

export const getDirection = (key: ArrowKey): Direction => {
  switch (key) {
    case 'UP':
      return Direction.N;
    case 'DOWN':
      return Direction.S;
    case 'LEFT':
      return Direction.W;
    case 'RIGHT':
      return Direction.E;
  }
};
