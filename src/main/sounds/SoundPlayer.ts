import CustomOscillator from './CustomOscillator';
import { Sample } from './types';

type Props = {
  polyphony: number;
  gain: number;
};

export default class SoundPlayer {
  private readonly context: AudioContext;
  private readonly gainNode: GainNode;
  private oscillators: CustomOscillator[];

  constructor({ gain }: Props) {
    this.context = new AudioContext();
    this.gainNode = this.context.createGain();
    this.gainNode.gain.value = gain * 0.2; // sounds can be VERY loud
    this.gainNode.connect(this.context.destination);

    this.oscillators = [];
  }

  stop = () => {
    try {
      for (const oscillator of this.oscillators) {
        oscillator.stop();
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  playSound = (samples: Sample[], repeating: boolean = false) => {
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
