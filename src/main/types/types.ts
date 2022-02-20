import Sprite from '../graphics/sprites/Sprite';
import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
import TileType from '../tiles/TileType';

interface Pixel {
  x: number,
  y: number
}

interface Entity extends Coordinates {
  char: string,
  sprite: Sprite
}

type EquipmentSlot = 'MELEE_WEAPON' | 'RANGED_WEAPON' | 'CHEST' | 'HEAD';

type GameScreen = 'GAME' | 'INVENTORY' | 'TITLE' | 'VICTORY' | 'GAME_OVER' | 'MINIMAP';

enum ItemCategory {
  POTION = 'POTION',
  SCROLL = 'SCROLL',
  KEY = 'KEY',
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

type Faction = 'PLAYER' | 'FRIENDLY' | 'NEUTRAL' | 'ENEMY';

export {
  Entity,
  EquipmentSlot,
  Faction,
  GameScreen,
  ItemCategory,
  MapLayout,
  MapSection,
  Offsets,
  Pixel,
  Projectile,
  Rect,
  Room,
  UnitType
};
