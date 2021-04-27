import { Direction } from './types';

const Directions = {
  N: { dx: 0, dy: -1 },
  E: { dx: 1, dy: 0 },
  S: { dx: 0, dy: 1 },
  W: { dx: -1, dy: 0 }
};

function _equals(first: Direction, second: Direction) {
  return first.dx === second.dx && first.dy === second.dy;
}

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

function _toLegacyDirection(direction: Direction): string {
  const lookup = {
    'N': 'NW',
    'E': 'NE',
    'S': 'SE',
    'W': 'SW'
  }
  return Object.entries(lookup)
    // @ts-ignore
    .filter(([from, to]) => _equals(direction, Directions[from]))
    .map(([from, to]) => to)
    [0];
}

export default {
  N: Directions.N,
  E: Directions.E,
  S: Directions.S,
  W: Directions.W,
  values: () => [Directions.N, Directions.E, Directions.S, Directions.W],
  toString: _directionToString,
  toLegacyDirection: _toLegacyDirection
};