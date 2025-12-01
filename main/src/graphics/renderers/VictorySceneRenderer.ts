import { Pixel } from '@duzh/geometry';
import { Color, Graphics } from '@duzh/graphics';
import { ImageFactory } from '@duzh/graphics/images';
import { formatTimestamp } from '@main/utils/time';
import { Game } from '@main/core/Game';
import { FontName } from '@main/graphics/Fonts';
import { InterfaceColors } from '@main/graphics/InterfaceColors';
import { Alignment, drawAligned } from '@main/graphics/RenderingUtils';
import { TextRenderer } from '@main/graphics/TextRenderer';
import { Renderer } from './Renderer';

const BACKGROUND_FILENAME = 'victory2';

export class VictorySceneRenderer implements Renderer {
  constructor(
    private readonly game: Game,
    private readonly textRenderer: TextRenderer,
    private readonly imageFactory: ImageFactory
  ) {}

  render = async (graphics: Graphics): Promise<void> => {
    const { imageFactory } = this;
    const { state } = this.game;
    const image = await imageFactory.getImage({ filename: BACKGROUND_FILENAME });
    graphics.drawScaledImage(image, {
      left: 0,
      top: 0,
      width: graphics.getWidth(),
      height: graphics.getHeight()
    });
    const elapsedTurns = state.getTurn();
    const elapsedTime = formatTimestamp(state.getElapsedTime());
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
        InterfaceColors.WHITE,
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
      backgroundColor: InterfaceColors.BLACK
    });
    drawAligned(imageData, graphics, pixel, textAlign);
  };
}
