"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CustomOscillator = /** @class */ (function () {
    function CustomOscillator(context, gainNode, repeating) {
        this._delegate = context.createOscillator();
        this._delegate.type = 'square';
        this._delegate.connect(gainNode);
        this._isComplete = false;
        this._isRepeating = repeating;
    }
    CustomOscillator.prototype.play = function (samples, context) {
        var _this = this;
        if (samples.length) {
            var startTime = context.currentTime;
            var nextStartTime = startTime;
            for (var i = 0; i < samples.length; i++) {
                var _a = samples[i], freq = _a[0], ms = _a[1];
                this._delegate.frequency.setValueAtTime(freq, nextStartTime);
                nextStartTime += ms / 1000;
            }
            var runtime = samples.map(function (_a) {
                var freq = _a[0], ms = _a[1];
                return ms;
            }).reduce(function (a, b) { return a + b; });
            this._delegate.start();
            this._delegate.onended = function () {
                if (_this._isRepeating && !_this._isComplete) {
                    _this.play(samples, context);
                }
                else {
                    _this._isComplete = true;
                }
            };
            this._delegate.stop(startTime + runtime / 1000);
        }
    };
    CustomOscillator.prototype.isComplete = function () {
        return this._isComplete;
    };
    CustomOscillator.prototype.stop = function () {
        this._delegate.stop(0);
        this._isComplete = true;
    };
    return CustomOscillator;
}());
exports.default = CustomOscillator;
//# sourceMappingURL=CustomOscillator.js.map