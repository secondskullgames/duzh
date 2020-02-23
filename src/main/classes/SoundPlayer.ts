import { Sample } from '../types';

type CustomOscillator = {
  node: OscillatorNode,
  isRepeating: boolean,
  started: boolean,
  stopped: boolean
}

class SoundPlayer {
  private readonly _context: AudioContext;
  private readonly _gainNode: GainNode;
  private _oscillators: CustomOscillator[];

  constructor (maxPolyphony: number, gain: number) {
    this._context = new AudioContext();
    this._gainNode = this._context.createGain();
    this._gainNode.gain.value = gain * 0.1; // sounds can be VERY loud
    this._gainNode.connect(this._context.destination);

    this._oscillators = [];
  }

  private _newOscillator(): CustomOscillator {
    const oscillatorNode = this._context.createOscillator();
    oscillatorNode.type = 'square';
    oscillatorNode.connect(this._gainNode);

    return {
      node: oscillatorNode,
      started: false,
      stopped: false,
      isRepeating: false
    };
  };

  stop() {
    try {
      this._oscillators.forEach(oscillator => {
        if (oscillator && oscillator.started) {
          oscillator.node.stop(0);
          oscillator.stopped = true;
        }
      });
      this._oscillators = [];
    } catch (e) {
      console.error(e);
    }
  };

  playSound(samples: Sample[], repeating: boolean = false) {
    const oscillator = this._newOscillator();
    this._oscillators.push(oscillator);
    if (samples.length) {
      const startTime = this._context.currentTime;
      let nextStartTime = startTime;
      for (let i = 0; i < samples.length; i++) {
        const [freq, ms] = samples[i];
        oscillator.node.frequency.setValueAtTime(freq, nextStartTime);
        nextStartTime += ms / 1000;
      }
      const runtime = samples.map(([freq, ms]) => ms).reduce((a, b) => a + b);
      oscillator.node.start();
      oscillator.started = true;

      if (repeating) {
        oscillator.isRepeating = true;
      }
      oscillator.node.onended = () => {
        if (oscillator.isRepeating && !oscillator.stopped) {
          this.playSound(samples, true);
        } else {
          this._oscillators.splice(this._oscillators.indexOf(oscillator, 1));
        }
      };
      oscillator.node.stop(startTime + runtime / 1000);
    }
  };
}

export default SoundPlayer;