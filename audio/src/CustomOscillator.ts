import { Sample } from '@duzh/models';

export class CustomOscillator {
  private readonly delegate: OscillatorNode;
  private readonly isRepeating: boolean;
  private _isComplete: boolean;
  private _listener: (() => void) | null;

  constructor(context: AudioContext, gainNode: GainNode, repeating: boolean) {
    this.delegate = context.createOscillator();
    this.delegate.type = 'square';
    this.delegate.connect(gainNode);
    this._isComplete = false;
    this.isRepeating = repeating;
    this._listener = null;
  }

  play = (samples: Sample[], context: AudioContext) => {
    if (samples.length) {
      const startTime = context.currentTime;
      let nextStartTime = startTime;
      for (let i = 0; i < samples.length; i++) {
        const [freq, ms] = samples[i];
        this.delegate.frequency.setValueAtTime(freq, nextStartTime);
        nextStartTime += ms / 1000;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const runtime = samples.map(([freq, ms]) => ms).reduce((a, b) => a + b);
      this.delegate.start();

      this._listener = () => {
        if (this.isRepeating && !this._isComplete) {
          this.play(samples, context);
        } else {
          this._isComplete = true;
        }
      };
      this.delegate.stop(startTime + runtime / 1000);
    }
  };

  isComplete = () => {
    return this._isComplete;
  };

  stop = () => {
    this.delegate.stop(0);
    this._isComplete = true;
  };

  cleanup = () => {
    if (this._listener) {
      this.delegate.removeEventListener('ended', this._listener);
    }
    this.delegate.disconnect();
  };
}
