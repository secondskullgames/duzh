"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CustomOscillator_1 = require("./CustomOscillator");
var SoundPlayer = /** @class */ (function () {
    function SoundPlayer(maxPolyphony, gain) {
        this._context = new AudioContext();
        this._gainNode = this._context.createGain();
        this._gainNode.gain.value = gain * 0.2; // sounds can be VERY loud
        this._gainNode.connect(this._context.destination);
        this._oscillators = [];
    }
    SoundPlayer.prototype.stop = function () {
        try {
            this._oscillators.forEach(function (oscillator) { return oscillator.stop(); });
        }
        catch (e) {
            console.error(e);
        }
    };
    ;
    SoundPlayer.prototype.playSound = function (samples, repeating) {
        if (repeating === void 0) { repeating = false; }
        var oscillator = new CustomOscillator_1.default(this._context, this._gainNode, repeating);
        oscillator.play(samples, this._context);
        this._oscillators.push(oscillator);
        this._cleanup();
    };
    ;
    SoundPlayer.prototype._cleanup = function () {
        this._oscillators = this._oscillators.filter(function (o) { return !o.isComplete(); });
    };
    return SoundPlayer;
}());
exports.default = SoundPlayer;
//# sourceMappingURL=SoundPlayer.js.map