import { Sample, SoundEffect } from '@duzh/models';
import { CustomOscillator } from './CustomOscillator.js';

type Props = Readonly<{
  polyphony: number;
  gain: number;
}>;

export class SoundPlayer {
  private readonly context: AudioContext;
  private readonly gainNode: GainNode;
  private oscillators: CustomOscillator[];

  private constructor({ gain }: Props) {
    this.context = new AudioContext();
    this.gainNode = this.context.createGain();
    this.gainNode.gain.value = gain * 0.2; // sounds can be VERY loud
    this.gainNode.connect(this.context.destination);

    this.oscillators = [];
  }

  static forSounds = (): SoundPlayer => {
    return new SoundPlayer({ polyphony: 1, gain: 0.15 });
  };

  static forMusic = (): SoundPlayer => {
    return new SoundPlayer({ polyphony: 4, gain: 0.06 });
  };

  stop = () => {
    try {
      for (const oscillator of this.oscillators) {
        oscillator.stop();
      }
    } catch (e) {
      console.error(e);
    }
  };

  playSound = (sound: SoundEffect, repeating: boolean = false) => {
    this.playSamples(sound.samples, repeating);
  };

  playSamples = (samples: Sample[], repeating: boolean = false) => {
    const oscillator = new CustomOscillator(this.context, this.gainNode, repeating);
    oscillator.play(samples, this.context);
    this.oscillators.push(oscillator);
    this._cleanup();
  };

  private _cleanup = () => {
    for (const oscillator of this.oscillators) {
      if (oscillator.isComplete()) {
        oscillator.cleanup();
      }
    }
    this.oscillators = this.oscillators.filter(o => !o.isComplete());
  };
}
