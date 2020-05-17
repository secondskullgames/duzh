import { Rect } from '../../main/types/types';
import { areAdjacent } from '../../main/maps/MapUtils';

function testAreAdjacent() {
  // ####
  // ####****
  // ####****
  const first: Rect = { left: 0, top: 0, width: 4, height: 3 };
  const second: Rect = { left: 4, top: 1, width: 4, height: 2 };
  _assert(areAdjacent(first, second, 2));
  _assert(!areAdjacent(first, second, 3));
}

function _assert(condition: boolean, message: string = 'fux') {
  if (!condition) {
    throw new Error(message);
  }
}

export default function() {
  testAreAdjacent();
}