import { Game } from '@main/core/Game';
import { SceneName } from '@main/scenes/SceneName';
import Music from '@main/sounds/Music';
import { Feature } from '@main/utils/features';

/**
 * Fully reset the game and show the title screen.
 */
export const showTitleScreen = async (game: Game) => {
  const { state, musicController } = game;
  state.reset();
  state.setScene(SceneName.TITLE);
  if (Feature.isEnabled(Feature.TITLE_MUSIC)) {
    musicController.playMusic(Music.EVIL);
  }
};
