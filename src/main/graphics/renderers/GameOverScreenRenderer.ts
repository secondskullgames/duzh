import { Renderer } from '@main/graphics/renderers/Renderer';
import { Graphics } from '@lib/graphics/Graphics';
import { FontName } from '@main/graphics/Fonts';
import Colors from '@main/graphics/Colors';
import { Alignment, drawAligned } from '@main/graphics/RenderingUtils';
import ImageFactory from '@lib/graphics/images/ImageFactory';
import { Pixel } from '@lib/geometry/Pixel';
import { Color } from '@lib/graphics/Color';
import { TextRenderer } from '@main/graphics/TextRenderer';
import { inject, injectable } from 'inversify';

const BACKGROUND_FILENAME = 'gameover';

@injectable()
export class GameOverScreenRenderer implements Renderer {
  constructor(
    @inject(ImageFactory)
    private readonly imageFactory: ImageFactory,
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer
  ) {}

  render = async (graphics: Graphics): Promise<void> => {
    const image = await this.imageFactory.getImage({ filename: BACKGROUND_FILENAME });
    graphics.drawScaledImage(image, {
      left: 0,
      top: 0,
      width: graphics.getWidth(),
      height: graphics.getHeight()
    });
    this._drawText(
      'PRESS ENTER TO PLAY AGAIN',
      FontName.APPLE_II,
      { x: 320, y: 300 },
      Colors.WHITE,
      Alignment.CENTER,
      graphics
    );
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
      backgroundColor: Colors.BLACK
    });
    drawAligned(imageData, graphics, pixel, textAlign);
  };
}
