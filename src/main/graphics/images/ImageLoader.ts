import { createCanvas, createImage, getCanvasContext } from '@main/utils/dom';
import { AssetLoader } from '@main/assets/AssetLoader';
import { inject, injectable } from 'inversify';

@injectable()
export default class ImageLoader {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly assetLoader: AssetLoader;

  private img: HTMLImageElement;

  private _listener: (() => void) | null;
  private _errorListener: (() => void) | null;

  constructor(@inject(AssetLoader) assetLoader: AssetLoader) {
    this.assetLoader = assetLoader;
    // this is way bigger than the screen because of fonts
    this.canvas = createCanvas({
      width: 2000,
      height: 2000,
      offscreen: true
    });
    this.context = getCanvasContext(this.canvas);
    this.img = createImage();
    this.img.style.display = 'none';

    this._listener = null;
    this._errorListener = null;
  }

  loadImage = async (filename: string): Promise<ImageData | null> => {
    const imageDataUrl = await this.assetLoader.loadImageAsset(`${filename}.png`);
    if (!imageDataUrl) {
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
  };
}
