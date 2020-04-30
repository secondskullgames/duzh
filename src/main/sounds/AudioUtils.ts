import { Sample } from '../types/types';
import SoundPlayer from './SoundPlayer';

const _getMusicPlayer = () => new SoundPlayer(4, 0.12);
const _getSoundPlayer = () => new SoundPlayer(4, 0.20);

// TODO very hacky memoizing
let MUSIC: SoundPlayer | null = null;
let SFX: SoundPlayer | null = null;

function playSound(samples: Sample[]) {
  if (!SFX) {
    SFX = _getSoundPlayer();
  }
  SFX.playSound(samples, false);
}

function playMusic(samples: Sample[]) {
  if (!MUSIC) {
    MUSIC = _getMusicPlayer();
  }
  MUSIC.playSound(samples, false);
}

function stopMusic() {
  if (MUSIC) {
    MUSIC.stop();
  }
}

export {
  playSound,
  playMusic,
  stopMusic
};