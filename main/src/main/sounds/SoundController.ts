import { AssetBundle } from '@duzh/assets';
import { SoundPlayer } from '@duzh/audio';
import { SoundName } from '@main/sounds/SoundName';
import { checkNotNull } from '@duzh/utils/preconditions';

export class SoundController {
  constructor(
    private readonly assetBundle: AssetBundle,
    private readonly soundPlayer: SoundPlayer
  ) {}

  playSound = (name: SoundName, repeating: boolean = false) => {
    const sound = checkNotNull(this.assetBundle.sounds[name]);
    this.soundPlayer.playSound(sound, repeating);
  };

  stop = () => {
    this.soundPlayer.stop();
  };
}
