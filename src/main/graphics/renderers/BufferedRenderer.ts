import AbstractRenderer from './AbstractRenderer';
import { createCanvas, getCanvasContext } from '../../utils/dom';

type Props = Readonly<{
  width: number,
  height: number,
  id: string
}>;

/**
 * Subclasses are expected to override the {@link #renderBuffer} method,
 * and the parent class will handle the {@link #render} step
 */
export default abstract class BufferedRenderer extends AbstractRenderer {
  protected readonly bufferCanvas: HTMLCanvasElement;
  protected readonly bufferContext: CanvasRenderingContext2D;

  protected constructor({ width, height, id }: Props) {
    super({ width, height, id });

    this.bufferCanvas = createCanvas({ width, height });
    this.bufferContext = getCanvasContext(this.bufferCanvas);
  }

  _redraw = async (): Promise<void> => {
    const { width, height } = this;
    await this.renderBuffer();
    this.context.putImageData(this.bufferContext.getImageData(0, 0, width, height), 0, 0);
  };

  abstract renderBuffer(): Promise<void>;

  getCanvas = () => this.canvas;
}
