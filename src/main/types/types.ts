import Sprite from '../graphics/sprites/Sprite';
import Coordinates from './Coordinates';
import Direction from './Direction';
import TileType from './TileType';

enum Activity {
  STANDING = 'STANDING',
  WALKING = 'WALKING',
  ATTACKING = 'ATTACKING',
  SHOOTING = 'SHOOTING',
  DAMAGED = 'DAMAGED'
}

namespace Activity {
  export const values = (): Activity[] => [
    Activity.STANDING,
    Activity.WALKING,
    Activity.ATTACKING,
    Activity.SHOOTING
  ];
}

interface Pixel {
  x: number,
  y: number
}

type CoordinatePair = [Coordinates, Coordinates];

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

type MapLayout = 'ROOMS_AND_CORRIDORS' | 'BLOB';

interface Projectile extends Entity {
  direction: Direction
}

type Offsets = { dx: number, dy: number };

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

type UnitType =
  'ANIMAL'
  | 'ELEMENTAL'
  | 'GHOST'
  | 'GOLEM'
  | 'HUMAN'
  | 'WIZARD';

export {
  Activity,
  Coordinates,
  CoordinatePair,
  Entity,
  EquipmentSlot,
  GameScreen,
  ItemCategory,
  MapLayout,
  MapSection,
  Offsets,
  Pixel,
  Projectile,
  PromiseSupplier,
  Rect,
  Room,
  UnitType
};
