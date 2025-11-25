import { Rect } from '../Rect.js';
import { areAdjacent } from '../RectUtils.js';
import { expect, test } from 'vitest';

test('areAdjacent', () => {
  // right-left
  // ####
  // ####****
  // ####****
  {
    const first: Rect = { left: 0, top: 0, width: 4, height: 3 };
    const second: Rect = { left: 4, top: 1, width: 4, height: 2 };
    expect(areAdjacent(first, second, 2)).toBe(true);
    expect(!areAdjacent(first, second, 3)).toBe(true);
  }

  // bottom-top
  //
  //   ####
  //   ####
  //    ***
  //    ***
  {
    const first: Rect = { left: 2, top: 2, width: 4, height: 2 };
    const second: Rect = { left: 3, top: 4, width: 3, height: 2 };
    expect(areAdjacent(first, second, 3)).toBe(true);
    expect(!areAdjacent(first, second, 4)).toBe(true);
  }

  // left-right
  {
    const first: Rect = { left: 6, top: 0, width: 6, height: 7 };
    const second: Rect = { left: 0, top: 0, width: 6, height: 7 };
    expect(areAdjacent(first, second, 5)).toBe(true);
  }
});
