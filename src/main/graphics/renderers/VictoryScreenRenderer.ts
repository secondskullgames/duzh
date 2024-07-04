import { Graphics } from '@lib/graphics/Graphics';
import { Renderer } from '@main/graphics/renderers/Renderer';
import { formatTimestamp } from '@lib/utils/time';
import { FontName } from '@main/graphics/Fonts';
import Colors from '@main/graphics/Colors';
import { Alignment, drawAligned } from '@main/graphics/RenderingUtils';
import { Pixel } from '@lib/geometry/Pixel';
import { Color } from '@lib/graphics/Color';
import { TextRenderer } from '@main/graphics/TextRenderer';
import { Session } from '@main/core/Session';
import ImageFactory from '@lib/graphics/images/ImageFactory';
import { inject, injectable } from 'inversify';

const BACKGROUND_FILENAME = 'victory2';

@injectable()
export class VictoryScreenRenderer implements Renderer {
  constructor(
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer,
    @inject(Session)
    private readonly session: Session,
    @inject(ImageFactory)
    private readonly imageFactory: ImageFactory
  ) {}

  render = async (graphics: Graphics): Promise<void> => {
    const { session, imageFactory } = this;
    const image = await imageFactory.getImage({ filename: BACKGROUND_FILENAME });
    graphics.drawScaledImage(image, {
      left: 0,
      top: 0,
      width: graphics.getWidth(),
      height: graphics.getHeight()
    });
    const elapsedTurns = session.getTurn();
    const elapsedTime = formatTimestamp(session.getElapsedTime());
    const lines = [
      `Finished in ${elapsedTurns} turns (${elapsedTime})`,
      'PRESS ENTER TO PLAY AGAIN'
    ];
    let y = 300;
    for (const line of lines) {
      this._drawText(
        line,
        FontName.APPLE_II,
        { x: 320, y },
        Colors.WHITE,
        Alignment.CENTER,
        graphics
      );
      y += 20;
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
      backgroundColor: Colors.BLACK
    });
    drawAligned(imageData, graphics, pixel, textAlign);
  };
}
