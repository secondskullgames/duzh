import SpriteFactory from '../graphics/sprites/SpriteFactory';
import { Tile } from './types';

const Tiles = {
  FLOOR: {
    name: 'FLOOR',
    char: '.',
    sprite: SpriteFactory.FLOOR(),
    isBlocking: false
  },
  FLOOR_HALL: {
    name: 'FLOOR_HALL',
    char: '.',
    sprite: SpriteFactory.FLOOR_HALL(),
    isBlocking: false
  },
  WALL_TOP: {
    name: 'WALL_TOP',
    char: '#',
    sprite: SpriteFactory.WALL_TOP(),
    isBlocking: true
  },
  WALL_HALL: {
    name: 'WALL_HALL',
    char: '#',
    sprite: SpriteFactory.WALL_HALL(),
    isBlocking: true
  },
  WALL: {
    name: 'WALL',
    char: ' ',
    sprite: null,
    isBlocking: true
  },
  NONE: {
    name: 'NONE',
    char: ' ',
    sprite: null,
    isBlocking: true
  },
  STAIRS_DOWN: {
    name: 'STAIRS_DOWN',
    char: '>',
    sprite: SpriteFactory.STAIRS_DOWN(),
    isBlocking: false
  }
};

export default Tiles;