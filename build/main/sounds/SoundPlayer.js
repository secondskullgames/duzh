var SoundPlayer = /** @class */ (function () {
    function SoundPlayer(maxPolyphony, gain) {
        this._context = new AudioContext();
        this._gainNode = this._context.createGain();
        this._gainNode.gain.value = gain * 0.2; // sounds can be VERY loud
        this._gainNode.connect(this._context.destination);
        this._oscillators = [];
    }
    SoundPlayer.prototype._newOscillator = function () {
        var oscillatorNode = this._context.createOscillator();
        oscillatorNode.type = 'square';
        oscillatorNode.connect(this._gainNode);
        return {
            node: oscillatorNode,
            started: false,
            stopped: false,
            isRepeating: false
        };
    };
    ;
    SoundPlayer.prototype.stop = function () {
        try {
            this._oscillators.forEach(function (oscillator) {
                if (oscillator && oscillator.started) {
                    oscillator.node.stop(0);
                    oscillator.stopped = true;
                }
            });
            this._oscillators = [];
        }
        catch (e) {
            console.error(e);
        }
    };
    ;
    SoundPlayer.prototype.playSound = function (samples, repeating) {
        var _this = this;
        if (repeating === void 0) { repeating = false; }
        var oscillator = this._newOscillator();
        this._oscillators.push(oscillator);
        if (samples.length) {
            var startTime = this._context.currentTime;
            var nextStartTime = startTime;
            for (var i = 0; i < samples.length; i++) {
                var _a = samples[i], freq = _a[0], ms = _a[1];
                oscillator.node.frequency.setValueAtTime(freq, nextStartTime);
                nextStartTime += ms / 1000;
            }
            var runtime = samples.map(function (_a) {
                var freq = _a[0], ms = _a[1];
                return ms;
            }).reduce(function (a, b) { return a + b; });
            oscillator.node.start();
            oscillator.started = true;
            if (repeating) {
                oscillator.isRepeating = true;
            }
            oscillator.node.onended = function () {
                if (oscillator.isRepeating && !oscillator.stopped) {
                    _this.playSound(samples, true);
                }
                else {
                    _this._oscillators.splice(_this._oscillators.indexOf(oscillator, 1));
                }
            };
            oscillator.node.stop(startTime + runtime / 1000);
        }
    };
    ;
    return SoundPlayer;
}());
export default SoundPlayer;
//# sourceMappingURL=SoundPlayer.js.map