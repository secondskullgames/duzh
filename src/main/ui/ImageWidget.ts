import { Widget } from '@lib/ui/Widget';
import { Rect } from '@lib/geometry/Rect';
import { Graphics } from '@lib/graphics/Graphics';
import { createCanvas } from '@lib/utils/dom';
import { Image } from '@lib/graphics/images/Image';

type Props = Readonly<{
  id: string;
  image: Image;
  rect?: Rect;
  onClick?: () => Promise<void>;
}>;

export class ImageWidget implements Widget {
  readonly id: string;
  readonly image: Image;
  readonly rect: Rect;
  private readonly graphics: Graphics;
  private readonly _onClick: (() => Promise<void>) | null;

  constructor({ id, image, rect, onClick }: Props) {
    this.id = id;
    this.image = image;
    this.rect = rect ?? { left: 0, top: 0, width: image.width, height: image.height };
    const canvas = createCanvas({ width: image.width, height: image.height });
    this.graphics = Graphics.forCanvas(canvas);
    this._onClick = onClick ?? null;
  }

  render = async (): Promise<ImageData> => {
    this.graphics.drawImageBitmap(this.image.bitmap, Rect.getTopLeft(this.rect));
    return this.graphics.getImageData();
  };

  onClick = async () => {
    await this._onClick?.();
  };
}
