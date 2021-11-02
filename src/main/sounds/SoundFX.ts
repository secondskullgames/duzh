import SoundPlayer from './SoundPlayer';
import { Sample } from './types';

let PLAYER: SoundPlayer | null = null;

const _getSoundPlayer = () => new SoundPlayer(4, 0.20);

const playSound = (samples: Sample[]) => {
  if (!PLAYER) {
    PLAYER = _getSoundPlayer();
  }
  PLAYER.playSound(samples, false);
};

export {
  playSound
};
