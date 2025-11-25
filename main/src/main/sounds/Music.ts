import EVIL from '@data/music/evil.json';
import TITLE_THEME from '@data/music/title_theme.json';
import { MusicModel } from '@duzh/models';

const Music = {
  EVIL,
  TITLE_THEME
};

type MusicName = keyof typeof Music;

export default Music as Record<MusicName, MusicModel>;
