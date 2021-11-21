type Props = {
  width: number,
  height: number,
  id: string
};

/**
 * Subclasses are expected to override the {@link #renderBuffer} method,
 * and the parent class will handle the {@link #render} step
 */
abstract class BufferedRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly id: string;

  protected readonly width: number;
  protected readonly height: number;
  protected readonly bufferCanvas: HTMLCanvasElement;
  protected readonly bufferContext: CanvasRenderingContext2D;

  protected constructor({ width, height, id }: Props) {
    this.width = width;
    this.height = height;
    this.id = id;

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.classList.add(this.id);
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    this.bufferCanvas = document.createElement('canvas');
    this.bufferCanvas.width = width;
    this.bufferCanvas.height = height;
    this.bufferContext = this.bufferCanvas.getContext('2d') as CanvasRenderingContext2D;
    this.bufferContext.imageSmoothingEnabled = false;
  }

  render = async (): Promise<ImageBitmap> => {
    const { width, height } = this;
    await this.renderBuffer();
    const imageBitmap = await createImageBitmap(this.bufferContext.getImageData(0, 0, width, height));
    await this.context.drawImage(imageBitmap, 0, 0);
    return createImageBitmap(this.context.getImageData(0, 0, width, height));
  };

  abstract renderBuffer(): Promise<void>;

  getCanvas = () => this.canvas;
}

export default BufferedRenderer;