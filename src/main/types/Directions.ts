import { Direction } from './types';

function _equals(first: Direction, second: Direction) {
  return first.dx === second.dx && first.dy === second.dy;
}

const Directions = {
  N: { dx: 0, dy: -1 },
  E: { dx: 1, dy: 0 },
  S: { dx: 0, dy: 1 },
  W: { dx: -1, dy: 0 }
};

function _directionToString(direction: Direction) {
  if (_equals(direction, Directions.N)) {
    return 'N';
  } else if (_equals(direction, Directions.E)) {
    return 'E';
  } else if (_equals(direction, Directions.S)) {
    return 'S';
  } else if (_equals(direction, Directions.W)) {
    return 'W';
  }
  throw `Invalid direction ${direction}`;
}

const Directions2 = {
  ...Directions,
  toString: _directionToString
};

export default Directions2;