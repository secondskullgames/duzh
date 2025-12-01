import { Renderer } from './Renderer';
import { Color, Graphics } from '@duzh/graphics';
import { FontName } from '../Fonts';
import { InterfaceColors } from '../InterfaceColors';
import { Alignment, drawAligned } from '../RenderingUtils';
import { Pixel } from '@duzh/geometry';
import { ImageFactory } from '@duzh/graphics/images';
import { TextRenderer } from '../TextRenderer';

const TITLE_FILENAME = 'title2';

export class TitleSceneRenderer implements Renderer {
  constructor(
    private readonly imageFactory: ImageFactory,
    private readonly textRenderer: TextRenderer
  ) {}

  render = async (graphics: Graphics): Promise<void> => {
    const image = await this.imageFactory.getImage({ filename: TITLE_FILENAME });
    graphics.drawScaledImage(image, {
      left: 0,
      top: 0,
      width: graphics.getWidth(),
      height: graphics.getHeight()
    });
    const halfSeconds = Math.floor(new Date().getTime() / 500);
    if (halfSeconds % 2 === 0) {
      this._drawText(
        'PRESS ENTER TO BEGIN',
        FontName.APPLE_II,
        { x: 320, y: 300 },
        InterfaceColors.WHITE,
        Alignment.CENTER,
        graphics
      );
    }
  };

  private _drawText = (
    text: string,
    fontName: FontName,
    pixel: Pixel,
    color: Color,
    textAlign: Alignment,
    graphics: Graphics
  ) => {
    const imageData = this.textRenderer.renderText({
      text,
      fontName,
      color,
      backgroundColor: InterfaceColors.BLACK
    });
    drawAligned(imageData, graphics, pixel, textAlign);
  };
}
