import { GameScreen } from '../types/types';
import Music from '../sounds/Music';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import GameState from '../core/GameState';

type Props = Readonly<{
  state: GameState
}>;

export const gameOver = async ({ state }: Props) => {
  state.setScreen(GameScreen.GAME_OVER);
  Music.stop();
  playSound(Sounds.GAME_OVER);
};