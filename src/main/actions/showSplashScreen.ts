import { GameScreen, GameState, Session } from '@main/core';

export const showSplashScreen = async (state: GameState, session: Session) => {
  session.setScreen(GameScreen.TITLE);
  const musicController = state.getMusicController();
  const evilTheme = await musicController.loadMusic('evil');
  musicController.playMusic(evilTheme);
};
