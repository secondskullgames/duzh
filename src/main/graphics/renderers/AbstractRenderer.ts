import { Renderer } from './Renderer';
import { createCanvas, getCanvasContext } from '../../utils/dom';

type Props = Readonly<{
  width: number,
  height: number,
  id: string
}>;

export default abstract class AbstractRenderer implements Renderer {
  protected readonly canvas: HTMLCanvasElement;
  protected readonly context: CanvasRenderingContext2D;
  protected readonly id: string;
  protected readonly width: number;
  protected readonly height: number;

  private totalRenderTimeMillis = 0;
  private numRenders = 0;

  protected constructor({ width, height, id }: Props) {
    this.width = width;
    this.height = height;
    this.id = id;

    this.canvas = createCanvas({ width, height });
    this.canvas.classList.add(this.id);
    this.context = getCanvasContext(this.canvas);
  }

  render = async (): Promise<ImageData> => {
    const t1 = new Date().getTime();
    const { width, height, id } = this;
    await this._redraw();
    const imageData = this.context.getImageData(0, 0, width, height);
    const t2 = new Date().getTime();
    this.totalRenderTimeMillis += (t2 - t1);
    this.numRenders++;
    const avgRenderTime = this.totalRenderTimeMillis / this.numRenders;
    console.debug(`${id} rendered in ${t2 - t1} ms (average: ${avgRenderTime.toFixed(2)} ms)`);
    return imageData;
  };

  abstract _redraw: () => Promise<void>;
}
