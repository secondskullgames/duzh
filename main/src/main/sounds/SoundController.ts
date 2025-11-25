import { AssetBundle } from '@main/assets/AssetBundle';
import { SoundPlayer } from '@duzh/audio';
import { SoundName } from '@main/sounds/SoundName';

export class SoundController {
  constructor(
    private readonly assetBundle: AssetBundle,
    private readonly soundPlayer: SoundPlayer
  ) {}

  playSound = (name: SoundName, repeating: boolean = false) => {
    const sound = this.assetBundle.getSoundModel(name);
    this.soundPlayer.playSound(sound, repeating);
  };

  stop = () => {
    this.soundPlayer.stop();
  };
}
