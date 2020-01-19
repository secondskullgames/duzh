window.jwb = window.jwb || {};

{
  window.jwb = window.jwb || {};

  const MUSIC = new SoundPlayer(4, 0.08);
  const SFX = new SoundPlayer(4, 0.15);
  jwb.audio = {
    playSound: (freqsAndLengths) => SFX.playSound(freqsAndLengths, false),
    playMusic: (freqsAndLengths) => MUSIC.playSound(freqsAndLengths, false)
  };
}
