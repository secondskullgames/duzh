import ImageLoader from './ImageLoader';

class Sprite {
  dx: number;
  dy: number;
  key: string;
  private readonly _imageMap: { [key: string]: ImageLoader };

  constructor(imageMap: { [filename: string]: ImageLoader }, key: string, { dx, dy }) {
    this._imageMap = imageMap;
    this.key = key;
    this.dx = dx;
    this.dy = dy;
    this.getImage();
  }

  getImage(): Promise<ImageBitmap> {
    const imageLoader = this._imageMap[this.key];
    if (!imageLoader) {
      throw `Invalid sprite key ${this.key}`;
    }
    imageLoader.load();
    return imageLoader.image;
  }

  setImage(key: string) {
    this.key = key;
    this.getImage();
  }
}

export default Sprite;