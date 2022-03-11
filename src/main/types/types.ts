import Sprite from '../graphics/sprites/Sprite';
import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';

/*
 * Note: The types defined in this file are mostly very general and/or legacy types that don't fit neatly into
 * an existing package.  In general, you should put types in their own file in an appropriate package.
 */

interface Pixel {
  x: number,
  y: number
}

interface Entity extends Coordinates {
  getSprite: () => Sprite;
  update: () => Promise<void>;
}

type GameScreen = 'GAME' | 'INVENTORY' | 'TITLE' | 'VICTORY' | 'GAME_OVER' | 'MINIMAP';

interface Projectile extends Entity {
  direction: Direction
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
  Faction,
  GameScreen,
  Pixel,
  Projectile,
  Rect,
  Room,
  UnitType
};
