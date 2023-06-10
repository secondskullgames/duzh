import { createImage, getOffscreenCanvasContext } from '../../utils/dom';

export default class ImageLoader {
  private readonly canvas: OffscreenCanvas;
  private readonly context: OffscreenCanvasRenderingContext2D;

  private img: HTMLImageElement;

  private _listener: (() => void) | null;
  private _errorListener: (() => void) | null;

  constructor() {
    // this is way bigger than the screen because of fonts
    this.canvas = new OffscreenCanvas(
      2000,
      2000
    );
    this.context = getOffscreenCanvasContext(this.canvas);
    this.img = createImage();
    this.img.style.display = 'none';

    this._listener = null;
    this._errorListener = null;
  }

  loadImage = async (filename: string): Promise<ImageData | null> => {
    let imageDataUrl: string;
    try {
      imageDataUrl = (await import(
        /* webpackMode: "lazy-once" */
        /* webpackChunkName: "images" */
        `../../../../png/${filename}.png`
      )).default;
    } catch {
      // this is expected for _B filenames
      return null;
    }

    const { img } = this;
    if (this._listener) {
      img.removeEventListener('load', this._listener);
    }
    if (this._errorListener) {
      img.removeEventListener('error', this._errorListener);
    }
    return new Promise((resolve, reject) => {
      this._listener = () => {
        resolve(this.createImageData(img));
      };
      img.addEventListener('load', this._listener);
      this._errorListener = () => {
        reject(`Failed to load image ${img.src}`);
      };
      img.addEventListener('error', this._errorListener);
      img.src = imageDataUrl;
    });
  };

  createImageData = (img: HTMLImageElement): ImageData => {
    const { context } = this;
    context.drawImage(img, 0, 0);
    return context.getImageData(0, 0, img.width, img.height);
  }
}