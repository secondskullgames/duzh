import Renderer from './Renderer';

type Props = {
  width: number,
  height: number,
  id: string
};

/**
 * Subclasses are expected to override the {@link #renderBuffer} method,
 * and the parent class will handle the {@link #render} step
 */
abstract class BufferedRenderer extends Renderer {
  protected readonly bufferCanvas: HTMLCanvasElement;
  protected readonly bufferContext: CanvasRenderingContext2D;

  protected constructor({ width, height, id }: Props) {
    super({ width, height, id });

    this.bufferCanvas = document.createElement('canvas');
    this.bufferCanvas.width = width;
    this.bufferCanvas.height = height;
    this.bufferContext = this.bufferCanvas.getContext('2d') as CanvasRenderingContext2D;
    this.bufferContext.imageSmoothingEnabled = false;
  }

  _redraw = async (): Promise<void> => {
    const { width, height } = this;
    await this.renderBuffer();
    this.context.putImageData(this.bufferContext.getImageData(0, 0, width, height), 0, 0);
  };

  abstract renderBuffer(): Promise<void>;

  getCanvas = () => this.canvas;
}

export default BufferedRenderer;
