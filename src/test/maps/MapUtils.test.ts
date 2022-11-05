import Rect from '../../main/geometry/Rect';
import { areAdjacent } from '../../main/maps/MapUtils';
import { expect, test } from '@jest/globals';

test('test adjacent rectangles', () => {
  // right-left
  // ####
  // ####****
  // ####****
  {
    const first: Rect = { left: 0, top: 0, width: 4, height: 3 };
    const second: Rect = { left: 4, top: 1, width: 4, height: 2 };
    _assert(areAdjacent(first, second, 2));
    _assert(!areAdjacent(first, second, 3));
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
    _assert(areAdjacent(first, second, 3));
    _assert(!areAdjacent(first, second, 4));
  }

  // left-right
  {
    const first: Rect = { left: 6, top: 0, width: 6, height: 7 };
    const second: Rect = { left: 0, top: 0, width: 6, height: 7 };
    _assert(areAdjacent(first, second, 5));
  }
});

const _assert = (condition: boolean) => {
  expect(condition).toEqual(true);
};
