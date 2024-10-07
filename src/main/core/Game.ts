import { Engine } from '@main/core/Engine';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { GameConfig } from '@main/core/GameConfig';

// First goal: replace all the (state,session) garbage with this
export type Game = Readonly<{
  config: GameConfig;
  engine: Engine;
  state: GameState;
  session: Session;
}>;

export const Game = Symbol('Game');
