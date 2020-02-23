import ImageLoader from './ImageLoader';

class Sprite {
  dx: number;
  dy: number;
  key: string;
  readonly defaultKey: string;
  private readonly _imageMap: { [key: string]: ImageLoader };

  constructor(imageMap: { [filename: string]: ImageLoader }, key: string, { dx, dy }: { dx: number, dy: number }) {
    this._imageMap = imageMap;
    this.defaultKey = key;
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
    return imageLoader.load();
  }

  setImage(key: string): Promise<any> {
    this.key = key;
    return this.getImage();
  }
}

export default Sprite;