import { SoundEffect } from './types';
import { SoundPlayer, Waveform } from '../../../../space-dagger-engine/src/audio';

let PLAYER: SoundPlayer | null = null;

const _getSoundPlayer = () => SoundPlayer.create();

const playSound = (soundEffect: SoundEffect) => {
  if (!PLAYER) {
    PLAYER = _getSoundPlayer();
  }
  PLAYER.playToneSequence(
    {
      tones: soundEffect.map(([frequency, duration]) => ({ frequency, duration })),
      waveform: Waveform.SQUARE
    },
    { volume: 0.2 }
  );
};

export { playSound };
