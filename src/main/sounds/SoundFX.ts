import SoundPlayer from './SoundPlayer';
import { Sample } from './types';

// TODO very hacky memoizing
let PLAYER: SoundPlayer | null = null;

function _getSoundPlayer() {
  return new SoundPlayer(4, 0.20);
}

function playSound(samples: Sample[]) {
  if (!PLAYER) {
    PLAYER = _getSoundPlayer();
  }
  PLAYER.playSound(samples, false);
}

export {
  playSound
};