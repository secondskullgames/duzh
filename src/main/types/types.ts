import Sprite from '../graphics/sprites/Sprite';
import Colors from './Colors';

enum Activity {
  STANDING = 'STANDING',
  WALKING = 'WALKING',
  ATTACKING = 'ATTACKING',
  DAMAGED = 'DAMAGED'
}

interface Coordinates {
  x: number,
  y: number
}

interface Direction {
  dx: number,
  dy: number
}

interface Entity extends Coordinates {
  char: string,
  sprite: Sprite
}

enum EquipmentSlot {
  MELEE_WEAPON = 'MELEE_WEAPON',
  RANGED_WEAPON = 'RANGED_WEAPON',
  ARMOR = 'ARMOR'
}

enum GameScreen {
  GAME = 'GAME',
  INVENTORY = 'INVENTORY'
}

enum ItemCategory {
  POTION = 'POTION',
  SCROLL = 'SCROLL',
  WEAPON = 'WEAPON'
}

interface MapSection {
  width: number,
  height: number,
  rooms: Room[],
  tiles: TileType[][]
}

interface Rect {
  left: number,
  top: number,
  width: number,
  height: number
}

type PaletteSwaps = {
  [src in Colors]?: Colors
}

interface Projectile extends Entity, Coordinates {
  direction: Direction
}

interface Room extends Rect {
  exits: Coordinates[]
}

type Sample = [number, number];

type SpriteSupplier = (paletteSwaps?: PaletteSwaps) => Sprite;

interface Tile {
  type: TileType,
  sprite: Sprite | null,
  isBlocking: boolean
}

type TileSet = {
  [tileType in TileType]: (Sprite | null)
};

enum TileType {
  FLOOR,
  FLOOR_HALL,
  WALL_TOP,
  WALL_HALL,
  WALL,
  NONE,
  STAIRS_DOWN
}

enum UnitType {
  HUMAN = 'HUMAN',
  ELEMENTAL = 'ELEMENTAL',
  GHOST = 'GHOST',
  GOLEM = 'GOLEM',
  WIZARD = 'WIZARD',
  ANIMAL = 'ANIMAL'
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
  Projectile,
  Rect,
  Room,
  Sample,
  SpriteSupplier,
  Tile,
  TileSet,
  TileType,
  UnitType
};
