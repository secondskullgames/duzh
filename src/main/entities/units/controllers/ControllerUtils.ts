import Game from '../../../core/Game';

type Context = Readonly<{
  game: Game
}>;

export const canMove = (speed: number, { game }: Context): boolean => {
  // deterministic version
  const turn = game.getTurn();
  return Math.floor(speed * turn) > Math.floor(speed * (turn - 1));

  // random version
  // return Math.random() < speed;
};