import GameState from '../core/GameState';

type Props = Readonly<{
  state: GameState
}>;

export const logMessage = (message: string, { state }: Props): void => {
  state.getMessages().log(message, state.getTurn());
};