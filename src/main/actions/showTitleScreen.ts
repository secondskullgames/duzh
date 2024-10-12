import { SceneName } from '@main/scenes/SceneName';
import { Feature } from '@main/utils/features';
import { Game } from '@main/core/Game';

/**
 * Fully reset the game and show the title screen.
 */
export const showTitleScreen = async (game: Game) => {
  const { state, musicController } = game;
  state.reset();
  state.setScene(SceneName.TITLE);
  if (Feature.isEnabled(Feature.TITLE_MUSIC)) {
    const evilTheme = await musicController.loadMusic('evil');
    musicController.playMusic(evilTheme);
  }
};
