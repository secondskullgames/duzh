import SoundPlayer from './SoundPlayer.js';
var _getMusicPlayer = function () { return new SoundPlayer(4, 0.12); };
var _getSoundPlayer = function () { return new SoundPlayer(4, 0.20); };
// TODO very hacky memoizing
var MUSIC = null;
var SFX = null;
function playSound(samples) {
    if (!SFX) {
        SFX = _getSoundPlayer();
    }
    SFX.playSound(samples, false);
}
function playMusic(samples) {
    if (!MUSIC) {
        MUSIC = _getMusicPlayer();
    }
    MUSIC.playSound(samples, false);
}
function stopMusic() {
    if (MUSIC) {
        MUSIC.stop();
    }
}
export { playSound, playMusic, stopMusic };
//# sourceMappingURL=AudioUtils.js.map