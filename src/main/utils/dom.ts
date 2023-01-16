export const toggleFullScreen = async () => {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    document.body.classList.remove('fullscreen');
  } else {
    await document.documentElement.requestFullscreen();
    document.body.classList.add('fullscreen');
  }
};
