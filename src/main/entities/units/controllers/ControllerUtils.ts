import { Session } from '../../../core/Session';

export const canMove = (speed: number, session: Session): boolean => {
  // deterministic version
  const turn = session.getTurn();
  return Math.floor(speed * turn) > Math.floor(speed * (turn - 1));

  // random version
  // return Math.random() < speed;
};
