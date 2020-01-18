window.jwb = window.jwb || {};

{
  function SoundPlayer() {
    this._context = new AudioContext();
    this._gainNode = this._context.createGain();
    this._gainNode.gain.value = 0.15;
    this._gainNode.connect(this._context.destination);

    this._newOscillator = function() {
      const o = this._context.createOscillator();
      o.type = 'square';
      o.connect(this._gainNode);
      o.isRepeating = false;
      return o;
    };

    this._stop = function() {
      try {
        if (this._oscillator && this._oscillator.started) {
          this._oscillator.stop(0);
          this._oscillator.stopped = true;
        }
      } catch (e) {
        console.error(e);
      }
    };

    /**
     * @param {[int,int][]} freqsAndLengths An array of [freq, ms]
     * @param {boolean} repeating
     */
    this._playMulti = function(freqsAndLengths, repeating) {
      this.stop();
      this._oscillator = this._newOscillator();
      if (freqsAndLengths.length) {
        const startTime = this._context.currentTime;
        let nextStartTime = startTime;
        for (let i = 0; i < freqsAndLengths.length; i++) {
          const [freq, ms] = freqsAndLengths[i];
          this._oscillator.frequency.setValueAtTime(freq, nextStartTime);
          nextStartTime += ms / 1000;
        }
        const runtime = freqsAndLengths.map(([freq, ms]) => ms).reduce((a, b) => a + b);
        this._oscillator.start();
        this._oscillator.started = true;

        if (repeating) {
          const o = this._oscillator;
          o.isRepeating = true;
          o.onended = () => (o.isRepeating && !o.stopped && this.playMulti(freqsAndLengths, true));
        }
        this._oscillator.stop(startTime + runtime / 1000);
      }
    };

    this.playSound = function(freqsAndLengths) {
      this._playMulti(freqsAndLengths, false);
    }
  }

  window.jwb = window.jwb || {};
  jwb.SoundPlayer = SoundPlayer;
}
