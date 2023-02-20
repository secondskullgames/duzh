import GameState from '../../core/GameState';

export const canMove = (speed: number): boolean => {
  // deterministic version
  const turn = GameState.getInstance().getTurn();
  return Math.floor(speed * turn) > Math.floor(speed * (turn - 1));

  // random version
  // return Math.random() < speed;
};