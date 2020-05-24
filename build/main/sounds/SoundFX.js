"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SoundPlayer_1 = require("./SoundPlayer");
// TODO very hacky memoizing
var PLAYER = null;
function _getSoundPlayer() {
    return new SoundPlayer_1.default(4, 0.20);
}
function playSound(samples) {
    if (!PLAYER) {
        PLAYER = _getSoundPlayer();
    }
    PLAYER.playSound(samples, false);
}
exports.playSound = playSound;
//# sourceMappingURL=SoundFX.js.map