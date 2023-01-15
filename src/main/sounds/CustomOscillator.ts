import { Sample } from './types';

class CustomOscillator {
  private readonly delegate: OscillatorNode;
  private readonly isRepeating: boolean;
  private _isComplete: boolean;

  constructor(context: AudioContext, gainNode: GainNode, repeating: boolean) {
    this.delegate = context.createOscillator();
    this.delegate.type = 'square';
    this.delegate.connect(gainNode);

    this._isComplete = false;
    this.isRepeating = repeating;
  }

  play(samples: Sample[], context: AudioContext) {
    if (samples.length) {
      const startTime = context.currentTime;
      let nextStartTime = startTime;
      for (let i = 0; i < samples.length; i++) {
        const [freq, ms] = samples[i];
        this.delegate.frequency.setValueAtTime(freq, nextStartTime);
        nextStartTime += ms / 1000;
      }
      const runtime = samples.map(([freq, ms]) => ms).reduce((a, b) => a + b);
      this.delegate.start();

      this.delegate.onended = () => {
        if (this.isRepeating && !this._isComplete) {
          this.play(samples, context);
        } else {
          this._isComplete = true;
        }
      };
      this.delegate.stop(startTime + runtime / 1000);
    }
  }

  isComplete() {
    return this._isComplete;
  }

  stop() {
    this.delegate.stop(0);
    this._isComplete = true;
  }
}

export default CustomOscillator;
