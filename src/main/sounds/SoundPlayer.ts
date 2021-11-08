import CustomOscillator from './CustomOscillator';
import { Sample } from './types';

class SoundPlayer {
  private readonly _context: AudioContext;
  private readonly _gainNode: GainNode;
  private _oscillators: CustomOscillator[];

  constructor (maxPolyphony: number, gain: number) {
    this._context = new AudioContext();
    this._gainNode = this._context.createGain();
    this._gainNode.gain.value = gain * 0.2; // sounds can be VERY loud
    this._gainNode.connect(this._context.destination);

    this._oscillators = [];
  }

  stop() {
    try {
      for (const oscillator of this._oscillators) {
        oscillator.stop();
      }
    } catch (e) {
      console.error(e);
    }
  };

  playSound(samples: Sample[], repeating: boolean = false) {
    const oscillator = new CustomOscillator(this._context, this._gainNode, repeating);
    oscillator.play(samples, this._context);
    this._oscillators.push(oscillator);
    this._cleanup();
  };

  _cleanup() {
    this._oscillators = this._oscillators.filter(o => !o.isComplete());
  }
}

export default SoundPlayer;
