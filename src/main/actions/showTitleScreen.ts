import { SceneName } from '@main/scenes/SceneName';
import { Feature } from '@main/utils/features';
import { Game } from '@main/core/Game';

export const showTitleScreen = async (game: Game) => {
  const { state, session } = game;
  session.setScene(SceneName.TITLE);
  if (Feature.isEnabled(Feature.TITLE_MUSIC)) {
    const musicController = state.getMusicController();
    const evilTheme = await musicController.loadMusic('evil');
    musicController.playMusic(evilTheme);
  }
};
