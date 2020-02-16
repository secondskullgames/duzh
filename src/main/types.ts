import SpriteFactory from './SpriteFactory';
import Sprite from "./classes/Sprite";

interface Coordinates {
  x: number,
  y: number
}

interface Rect {
  left: number,
  top: number,
  width: number,
  height: number
}

interface Room extends Rect {
  exits: Coordinates[]
}

interface MapSection {
  width: number,
  height: number,
  rooms: Room[],
  tiles: Tile[][]
}

interface Tile {
  name: string,
  char: string,
  sprite: Sprite,
  isBlocking: boolean
}

interface PaletteSwaps {
  [src: string]: string
}

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

type Sample = [number, number];

enum ItemCategory {
  POTION = 'POTION',
  SCROLL = 'SCROLL',
  WEAPON = 'WEAPON'
}

enum EquipmentCategory {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR'
}

enum GameScreen
{
  GAME = 'GAME',
  INVENTORY = 'INVENTORY'
}

export {
  Coordinates,
  Rect,
  MapSection,
  PaletteSwaps,
  Tile,
  Room,
  Sample,
  ItemCategory,
  EquipmentCategory,
  GameScreen,
  Tiles
};
