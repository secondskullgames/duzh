import { SceneName } from '@main/scenes/SceneName';
import { Feature } from '@main/utils/features';
import { Game } from '@main/core/Game';

/**
 * Fully reset the game and show the title screen.
 */
export const showTitleScreen = async (game: Game) => {
  const { state, musicController, assetBundle } = game;
  state.reset();
  state.setScene(SceneName.TITLE);
  if (Feature.isEnabled(Feature.TITLE_MUSIC)) {
    const evilTheme = assetBundle.getMusicModel('evil');
    musicController.playMusic(evilTheme);
  }
};
