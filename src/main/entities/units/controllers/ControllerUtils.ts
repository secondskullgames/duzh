import { GlobalContext } from '../../../core/GlobalContext';

export const canMove = (speed: number, context: GlobalContext): boolean => {
  // deterministic version
  const turn = context.state.getTurn();
  return Math.floor(speed * turn) > Math.floor(speed * (turn - 1));

  // random version
  // return Math.random() < speed;
};