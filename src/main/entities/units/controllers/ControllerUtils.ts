import GameState from '../../../core/GameState';

type CanMoveContext = Readonly<{
  state: GameState
}>;

export const canMove = (speed: number, { state }: CanMoveContext): boolean => {
  // deterministic version
  const turn = state.getTurn();
  return Math.floor(speed * turn) > Math.floor(speed * (turn - 1));

  // random version
  // return Math.random() < speed;
};