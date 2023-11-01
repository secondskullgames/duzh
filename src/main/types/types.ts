import Coordinates from '../geometry/Coordinates';
import Rect from '../geometry/Rect';

/*
 * Note: The types defined in this file are mostly very general and/or legacy types that don't fit neatly into
 * an existing package.  In general, you should put types in their own file in an appropriate package.
 */

export type Room = Rect & {
  exits: Coordinates[];
};

export enum Faction {
  PLAYER = 'PLAYER',
  FRIENDLY = 'FRIENDLY',
  NEUTRAL = 'NEUTRAL',
  ENEMY = 'ENEMY'
}
