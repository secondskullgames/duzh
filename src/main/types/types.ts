import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
import Rect from '../geometry/Rect';
import Entity from './Entity';

/*
 * Note: The types defined in this file are mostly very general and/or legacy types that don't fit neatly into
 * an existing package.  In general, you should put types in their own file in an appropriate package.
 */

interface Pixel {
  x: number,
  y: number
}

type GameScreen = 'GAME' | 'INVENTORY' | 'TITLE' | 'VICTORY' | 'GAME_OVER' | 'MINIMAP';

type Room = Rect & {
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
  Faction,
  GameScreen,
  Pixel,
  Room,
  UnitType
};
