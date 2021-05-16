import Sprite from '../graphics/sprites/Sprite';
import Colors, { Color } from './Colors';

enum Activity {
  STANDING = 'STANDING',
  WALKING = 'WALKING',
  ATTACKING = 'ATTACKING',
  SHOOTING = 'SHOOTING',
  DAMAGED = 'DAMAGED'
}

interface Coordinates {
  x: number,
  y: number
}

type CoordinatePair = [Coordinates, Coordinates];

interface Direction {
  dx: number,
  dy: number
}

interface Entity extends Coordinates {
  char: string,
  sprite: Sprite
}

enum EquipmentSlot {
  MELEE_WEAPON  = 'MELEE_WEAPON',
  RANGED_WEAPON = 'RANGED_WEAPON',
  CHEST         = 'CHEST',
  HEAD          = 'HEAD'
}

enum GameScreen {
  GAME      = 'GAME',
  INVENTORY = 'INVENTORY',
  TITLE     = 'TITLE',
  VICTORY   = 'VICTORY',
  GAME_OVER = 'GAME_OVER',
  MINIMAP   = 'MINIMAP'
}

enum ItemCategory {
  POTION = 'POTION',
  SCROLL = 'SCROLL',
  WEAPON = 'WEAPON',
  ARMOR  = 'ARMOR'
}

interface MapSection {
  width:  number,
  height: number,
  rooms:  Room[],
  tiles:  TileType[][]
}

enum MapLayout {
  ROOMS_AND_CORRIDORS = 'ROOMS_AND_CORRIDORS',
  BLOB                = 'BLOB'
}

type PaletteSwaps = {
  [src: string]: Color
}

interface Projectile extends Entity, Coordinates {
  direction: Direction
}

type PromiseSupplier<T> = (t?: T) => Promise<T>

interface Rect {
  left: number,
  top: number,
  width: number,
  height: number
}

interface Room extends Rect {
  exits: Coordinates[]
}

interface Tile {
  type: TileType,
  sprite: Sprite | null,
  isBlocking: boolean
}

type TileSet = {
  [tileType in TileType]?: (Sprite | null)[]
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

type UnitType = 'ANIMAL' | 'ELEMENTAL' | 'GHOST' | 'GOLEM' | 'HUMAN' | 'WIZARD';

export {
  Activity,
  Coordinates,
  CoordinatePair,
  Direction,
  Entity,
  EquipmentSlot,
  GameScreen,
  ItemCategory,
  MapLayout,
  MapSection,
  PaletteSwaps,
  Projectile,
  PromiseSupplier,
  Rect,
  Room,
  Tile,
  TileSet,
  TileType,
  UnitType
};
