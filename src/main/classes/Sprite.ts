import ImageSupplier from './ImageSupplier';

class Sprite {
  dx: number;
  dy: number;
  key: string;
  readonly defaultKey: string;
  private readonly _imageMap: { [key: string]: ImageSupplier };

  constructor(imageMap: { [filename: string]: ImageSupplier }, key: string, { dx, dy }: { dx: number, dy: number }) {
    this._imageMap = imageMap;
    this.defaultKey = key;
    this.key = key;
    this.dx = dx;
    this.dy = dy;
    this.getImage();
  }

  getImage(): Promise<ImageBitmap> {
    const imageSupplier = this._imageMap[this.key];
    if (!imageSupplier) {
      throw `Invalid sprite key ${this.key}`;
    }
    return imageSupplier.get();
  }

  setImage(key: string): Promise<any> {
    this.key = key;
    return this.getImage();
  }
}

export default Sprite;