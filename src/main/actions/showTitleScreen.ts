import { SceneName } from '@main/scenes/SceneName';
import { Feature } from '@main/utils/features';
import { Globals } from '@main/core/globals';

export const showTitleScreen = async () => {
  const { session, musicController } = Globals;
  session.setScene(SceneName.TITLE);
  if (Feature.isEnabled(Feature.TITLE_MUSIC)) {
    const evilTheme = await musicController.loadMusic('evil');
    musicController.playMusic(evilTheme);
  }
};
