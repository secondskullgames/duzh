import GameState from '../core/GameState';

type Context = Readonly<{
  state: GameState
}>;

export const logMessage = (message: string, { state }: Context): void => {
  state.getMessages().log(message, state.getTurn());
};