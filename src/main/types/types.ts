import Coordinates from '../geometry/Coordinates';
import Rect from '../geometry/Rect';

/*
 * Note: The types defined in this file are mostly very general and/or legacy types that don't fit neatly into
 * an existing package.  In general, you should put types in their own file in an appropriate package.
 */

export interface Pixel {
  x: number,
  y: number
}

export type GameScreen = 'GAME' | 'INVENTORY' | 'TITLE' | 'VICTORY' | 'GAME_OVER' | 'MINIMAP' | 'HELP';

export type Room = Rect & {
  exits: Coordinates[]
}

export type Faction = 'PLAYER' | 'FRIENDLY' | 'NEUTRAL' | 'ENEMY';
