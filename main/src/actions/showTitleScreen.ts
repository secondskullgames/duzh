import { Feature } from '@duzh/features';
import { Game } from '@main/core/Game';
import { SceneName } from '@main/scenes/SceneName';

/**
 * Fully reset the game and show the title screen.
 */
export const showTitleScreen = async (game: Game) => {
  const { state, musicController } = game;
  state.reset();
  state.setScene(SceneName.TITLE);
  if (Feature.isEnabled('title_music')) {
    musicController.playMusic('evil');
  }
};
