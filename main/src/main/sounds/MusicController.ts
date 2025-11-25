import { AssetBundle } from '@duzh/assets';
import { MusicPlayer } from '@duzh/audio';
import { Suite } from '@duzh/models';
import { MusicName } from '@main/sounds/MusicName';
import { checkNotNull } from '@duzh/utils/preconditions';

export class MusicController {
  constructor(
    private readonly assetBundle: AssetBundle,
    private readonly musicPlayer: MusicPlayer
  ) {}

  playMusic = (name: MusicName) => {
    const music = checkNotNull(this.assetBundle.music[name]);
    this.musicPlayer.playMusic(music);
  };

  /**
   * these are not asset-ized yet, and we're not currently using them,
   * so just provide a pass-through here.
   */
  playSuite = (suite: Suite) => {
    this.musicPlayer.playSuite(suite);
  };

  stop = () => {
    this.musicPlayer.stop();
  };
}
