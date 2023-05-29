export const toggleFullScreen = async () => {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    document.body.classList.remove('fullscreen');
  } else {
    await document.documentElement.requestFullscreen();
    document.body.classList.add('fullscreen');
  }
};

type CanvasProps = Readonly<{
  width: number,
  height: number
}>;

export const createCanvas = ({ width, height }: CanvasProps): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

export const createImage = (): HTMLImageElement => document.createElement('img');

/**
 * https://html.spec.whatwg.org/multipage/canvas.html#concept-canvas-will-read-frequently
 */
export const getCanvasContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  console.time('getCanvasContext');
  const context = canvas.getContext('2d', {
    willReadFrequently: true
  })!;
  context.imageSmoothingEnabled = false;
  console.timeEnd('getCanvasContext');
  return context;
};