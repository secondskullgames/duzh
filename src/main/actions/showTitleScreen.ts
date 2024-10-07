import { SceneName } from '@main/scenes/SceneName';
import { Feature } from '@main/utils/features';
import { Game } from '@main/core/Game';

/**
 * Fully reset the game and show the title screen.
 */
export const showTitleScreen = async (game: Game) => {
  const { session, state, mapController, musicController } = game;
  state.reset();
  session.reset();
  mapController.reset();
  session.setScene(SceneName.TITLE);
  if (Feature.isEnabled(Feature.TITLE_MUSIC)) {
    const evilTheme = await musicController.loadMusic('evil');
    musicController.playMusic(evilTheme);
  }
};
