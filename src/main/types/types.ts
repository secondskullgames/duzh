import Sprite from '../graphics/sprites/Sprite';
import Colors from './Colors';

interface Coordinates {
  x: number,
  y: number
}

interface Direction {
  dx: number,
  dy: number
}

interface Rect {
  left: number,
  top: number,
  width: number,
  height: number
}

interface Tile {
  name: string,
  char: string,
  sprite: Sprite | null,
  isBlocking: boolean
}

interface Entity extends Coordinates {
  char: string,
  sprite: Sprite
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

type PaletteSwaps = {
  [src in Colors]?: Colors
}

type Sample = [number, number];

enum ItemCategory {
  POTION = 'POTION',
  SCROLL = 'SCROLL',
  WEAPON = 'WEAPON'
}

enum EquipmentSlot {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR'
}

enum GameScreen {
  GAME = 'GAME',
  INVENTORY = 'INVENTORY'
}

type SpriteSupplier = (paletteSwaps?: PaletteSwaps) => Sprite;

enum Activity {
  STANDING = 'STANDING',
  WALKING = 'WALKING',
  DAMAGED = 'DAMAGED'
}

enum UnitType {
  HUMAN = 'HUMAN',
  ELEMENTAL = 'ELEMENTAL',
  GHOST = 'GHOST',
  GOLEM = 'GOLEM',
  WIZARD = 'WIZARD'
}

export {
  Activity,
  Coordinates,
  Direction,
  Entity,
  EquipmentSlot,
  GameScreen,
  ItemCategory,
  MapSection,
  PaletteSwaps,
  Rect,
  Room,
  Sample,
  SpriteSupplier,
  Tile,
  UnitType
};
