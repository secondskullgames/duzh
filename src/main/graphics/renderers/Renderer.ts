type Props = {
  width: number,
  height: number,
  id: string
};

abstract class Renderer {
  protected readonly canvas: HTMLCanvasElement;
  protected readonly context: CanvasRenderingContext2D;
  protected readonly id: string;
  protected readonly width: number;
  protected readonly height: number;

  protected constructor({ width, height, id }: Props) {
    this.width = width;
    this.height = height;
    this.id = id;

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.classList.add(this.id);
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  render = async (): Promise<ImageBitmap> => {
    const t1 = new Date().getTime();
    const { width, height, id } = this;
    await this._redraw();
    const imageBitmap = await createImageBitmap(this.context.getImageData(0, 0, width, height));
    const t2 = new Date().getTime();
    console.debug(`${id} rendered in ${t2 - t1} ms`);
    return imageBitmap;
  };

  abstract _redraw: () => Promise<void>;
}

export default Renderer;
