import { Sample } from '../types';
import SoundPlayer from '../classes/SoundPlayer';

const _getMusicPlayer = () => new SoundPlayer(4, 0.08);
const _getSoundPlayer = () => new SoundPlayer(4, 0.16);

// TODO very hacky memoizing
let MUSIC: SoundPlayer = null;
let SFX: SoundPlayer = null;

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

export {
  playSound,
  playMusic
};