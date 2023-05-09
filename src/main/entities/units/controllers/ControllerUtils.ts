import GameState from '../../../core/GameState';

type CanMoveProps = Readonly<{
  state: GameState
}>;

export const canMove = (speed: number, { state }: CanMoveProps): boolean => {
  // deterministic version
  const turn = state.getTurn();
  return Math.floor(speed * turn) > Math.floor(speed * (turn - 1));

  // random version
  // return Math.random() < speed;
};