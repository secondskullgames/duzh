import { createCanvas, createImage, getCanvasContext } from '../../utils/dom';

const img = createImage();
img.style.display = 'none';
let _listener: (() => void) | null = null;
let _errorListener: (() => void) | null = null;

export default class ImageLoader {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;

  constructor() {
    // this is way bigger than the screen because of fonts
    this.canvas = createCanvas({
      width: 2000,
      height: 2000
    });
    this.canvas.style.display = 'none';
    this.context = getCanvasContext(this.canvas);
  }

  loadImage = async (filename: string): Promise<ImageData | null> => {
    let image: string;
    try {
      image = (await import(
        /* webpackMode: "lazy-once" */
        /* webpackChunkName: "images" */
        `../../../../png/${filename}.png`
      )).default;
    } catch {
      // this is expected for _B filenames
      return null;
    }

    if (_listener) {
      img.removeEventListener('load', _listener);
    }
    if (_errorListener) {
      img.removeEventListener('error', _errorListener);
    }
    return new Promise((resolve, reject) => {
      _listener = () => {
        resolve(this.createImageData(img));
      };
      img.addEventListener('load', _listener);
      _errorListener = () => {
        reject(`Failed to load image ${img.src}`);
      };
      img.addEventListener('error', _errorListener);
      img.src = image;
    });
  };

  createImageData = (img: HTMLImageElement): ImageData => {
    const { context } = this;
    context.drawImage(img, 0, 0);
    return context.getImageData(0, 0, img.width, img.height);
  }
}