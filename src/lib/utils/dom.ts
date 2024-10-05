export const toggleFullScreen = async () => {
  if (document.fullscreenElement) {
    await exitFullScreen();
  } else {
    await enterFullScreen();
  }
};

export const enterFullScreen = async () => {
  try {
    await document.documentElement.requestFullscreen?.();
  } catch {
    // ignored
  }
  document.body.classList.add('fullscreen');
};

export const exitFullScreen = async () => {
  try {
    await document.exitFullscreen?.();
  } catch {
    // ignored
  }
  document.body.classList.remove('fullscreen');
};

type CanvasProps = Readonly<{
  width: number;
  height: number;
  offscreen?: boolean;
}>;

export const createCanvas = ({
  width,
  height,
  offscreen
}: CanvasProps): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  if (offscreen) {
    canvas.style.display = 'none';
  }
  return canvas;
};

export const createImage = (): HTMLImageElement => {
  return document.createElement('img');
};

/**
 * https://html.spec.whatwg.org/multipage/canvas.html#concept-canvas-will-read-frequently
 */
export const getCanvasContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  const context = canvas.getContext('2d', {
    willReadFrequently: true
  })!;
  context.imageSmoothingEnabled = false;
  return context;
};

export const getOffscreenCanvasContext = (
  canvas: OffscreenCanvas
): OffscreenCanvasRenderingContext2D => {
  return canvas.getContext('2d', {
    willReadFrequently: true
  }) as OffscreenCanvasRenderingContext2D;
};

export const isMobileDevice = (): boolean => navigator.maxTouchPoints > 0;
