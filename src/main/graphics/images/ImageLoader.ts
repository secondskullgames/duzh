import { createCanvas, createImage, getCanvasContext } from '../../utils/dom';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';

export default class ImageLoader {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;

  constructor() {
    this.canvas = createCanvas({
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT
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

    return new Promise((resolve, reject) => {
      const img = createImage();

      img.addEventListener('load', () => {
        resolve(this.createImageData(img));
      });

      img.style.display = 'none';
      img.onerror = () => {
        reject(`Failed to load image ${img.src}`);
      };
      img.src = image;
    });
  };

  createImageData = (img: HTMLImageElement): ImageData => {
    console.time('createImageData');
    const { context } = this;
    context.drawImage(img, 0, 0);

    const imageData = context.getImageData(0, 0, img.width, img.height);
    console.timeEnd('createImageData');
    return imageData;
  }
}