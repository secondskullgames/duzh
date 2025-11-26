import { Game } from '@main/core/Game';
import { SceneName } from '@main/scenes/SceneName';
import { Feature } from '@duzh/features';

/**
 * Fully reset the game and show the title screen.
 */
export const showTitleScreen = async (game: Game) => {
  const { state, musicController } = game;
  state.reset();
  state.setScene(SceneName.TITLE);
  if (Feature.isEnabled(Feature.TITLE_MUSIC)) {
    musicController.playMusic('evil');
  }
};
