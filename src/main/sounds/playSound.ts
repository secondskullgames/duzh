import SoundPlayer from './SoundPlayer';
import { SoundEffect } from './types';

let PLAYER: SoundPlayer | null = null;

const _getSoundPlayer = () => new SoundPlayer(1, 0.20);

const playSound = (soundEffect: SoundEffect) => {
  if (!PLAYER) {
    PLAYER = _getSoundPlayer();
  }
  PLAYER.playSound(soundEffect, false);
};

export {
  playSound
};
