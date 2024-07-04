import { Widget } from './Widget';
import { Rect } from '@lib/geometry/Rect';
import { check } from '@lib/utils/preconditions';
import { injectable } from 'inversify';

type Props = Readonly<{
  canvas: HTMLCanvasElement;
}>;

@injectable()
export class Container {
  readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly widgets: Widget[];

  constructor({ canvas }: Props) {
    this.canvas = canvas;
    this.context = check(canvas.getContext('2d', { willReadFrequently: true }));
    this.widgets = [];
    this.canvas.addEventListener('click', this._onClick);
  }

  addWidget = (widget: Widget) => {
    this.widgets.push(widget);
  };

  removeWidget = (widget: Widget) => {
    const index = this.widgets.indexOf(widget);
    check(index >= 0);
    this.widgets.splice(index, 1);
  };

  removeWidgetById = (id: string) => {
    const index = this.widgets.findIndex(widget => widget.id === id);
    check(index >= 0);
    this.widgets.splice(index, 1);
  };

  render = async () => {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.strokeStyle = 'black';
    this.context.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    for (const widget of this.widgets) {
      const { rect } = widget;
      const image = await widget.render();
      this.context.putImageData(image, rect.left, rect.top);
    }
  };

  private _onClick = (event: MouseEvent) => {
    const pixel = { x: event.offsetX, y: event.offsetY };
    for (const widget of this.widgets) {
      if (Rect.containsPoint(widget.rect, pixel)) {
        widget.onClick(event);
        return;
      }
    }
  };
}
