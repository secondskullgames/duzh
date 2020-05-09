import { Sample } from './types';

class CustomOscillator {
  private readonly _delegate: OscillatorNode;
  private readonly _isRepeating: boolean;
  private _isComplete: boolean;

  constructor(context: AudioContext, gainNode: GainNode, repeating: boolean) {
    this._delegate = context.createOscillator();
    this._delegate.type = 'square';
    this._delegate.connect(gainNode);

    this._isComplete = false;
    this._isRepeating = repeating;
  }

  play(samples: Sample[], context: AudioContext) {
    if (samples.length) {
      const startTime = context.currentTime;
      let nextStartTime = startTime;
      for (let i = 0; i < samples.length; i++) {
        const [freq, ms] = samples[i];
        this._delegate.frequency.setValueAtTime(freq, nextStartTime);
        nextStartTime += ms / 1000;
      }
      const runtime = samples.map(([freq, ms]) => ms).reduce((a, b) => a + b);
      this._delegate.start();

      this._delegate.onended = () => {
        if (this._isRepeating && !this._isComplete) {
          this.play(samples, context);
        } else {
          this._isComplete = true;
        }
      };
      this._delegate.stop(startTime + runtime / 1000);
    }
  }

  isComplete() {
    return this._isComplete;
  }

  stop() {
    this._delegate.stop(0);
    this._isComplete = true;
  }
}

export default CustomOscillator;