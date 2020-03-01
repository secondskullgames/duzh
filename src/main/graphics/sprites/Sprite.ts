import ImageSupplier from '../ImageSupplier';

/**
 * Note: It's expected that a separate Sprite instance will be created
 * per entity, and frame caching will be handled... somewhere else
 */
class Sprite {
  dx: number;
  dy: number;
  key: string;
  private readonly _imageMap: { [key: string]: ImageSupplier };

  constructor(
    imageMap: { [filename: string]: ImageSupplier },
    key: string,
    { dx, dy }: { dx: number, dy: number }
  ) {
    this._imageMap = imageMap;
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

  /**
   * This will be overridden by individual sprites to handle
   * e.g. unit-specific logic
   */
  update(): Promise<any> {
    return this.getImage();
  }
}

export default Sprite;