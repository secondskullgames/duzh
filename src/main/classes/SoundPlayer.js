{
  function SoundPlayer(maxPolyphony, gain) {
    this._context = new AudioContext();
    this._gainNode = this._context.createGain();
    this._gainNode.gain.value = gain * 0.2; // 0.15 is already VERY loud
    this._gainNode.connect(this._context.destination);

    this.oscillators = [];

    /**
     * @private
     */
    this._newOscillator = function () {
      const o = this._context.createOscillator();
      o.type = 'square';
      o.connect(this._gainNode);
      o.isRepeating = false;
      return o;
    };

    this.stop = function () {
      try {
        this.oscillators.forEach(oscillator => {
          if (oscillator && oscillator.started) {
            oscillator.stop(0);
            oscillator.stopped = true;
          }
        });
        this.oscillators = [];
      } catch (e) {
        console.error(e);
      }
    };

    /**
     * @param {[int,int][]} freqsAndLengths An array of [freq, ms]
     * @param {boolean} repeating
     */
    this.playSound = (freqsAndLengths, repeating = false) => {
      const oscillator = this._newOscillator();
      this.oscillators.push(oscillator);
      if (freqsAndLengths.length) {
        const startTime = this._context.currentTime;
        let nextStartTime = startTime;
        for (let i = 0; i < freqsAndLengths.length; i++) {
          const [freq, ms] = freqsAndLengths[i];
          oscillator.frequency.setValueAtTime(freq, nextStartTime);
          nextStartTime += ms / 1000;
        }
        const runtime = freqsAndLengths.map(([freq, ms]) => ms).reduce((a, b) => a + b);
        oscillator.start();
        oscillator.started = true;

        if (repeating) {
          oscillator.isRepeating = true;
        }
        oscillator.onended = () => {
          if (oscillator.isRepeating && !oscillator.stopped) {
            this.playSound(freqsAndLengths, true);
          } else {
            this.oscillators.splice(this.oscillators.indexOf(oscillator, 1));
          }
        };
        oscillator.stop(startTime + runtime / 1000);
      }
    };
  }

  window.jwb = window.jwb || {};
  jwb.SoundPlayer = SoundPlayer;
}