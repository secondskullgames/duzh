import { Renderer } from './Renderer';
import { FontName } from '../Fonts';
import { Alignment, drawAligned } from '../RenderingUtils';
import { TextRenderer } from '../TextRenderer';
import Colors from '../Colors';
import { Pixel } from '@lib/geometry/Pixel';
import { Graphics } from '@lib/graphics/Graphics';
import ImageFactory from '@lib/graphics/images/ImageFactory';
import { Color } from '@lib/graphics/Color';
import { checkNotNull } from '@lib/utils/preconditions';
import { ShrineOption } from '@main/core/session/ShrineMenuState';
import { Game } from '@main/core/Game';
import { inject, injectable } from 'inversify';

const BACKGROUND_FILENAME = 'bordered_background';

@injectable()
export class ShrineMenuRenderer implements Renderer {
  constructor(
    @inject(Game)
    private readonly game: Game,
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer,
    @inject(ImageFactory)
    private readonly imageFactory: ImageFactory
  ) {}

  render = async (graphics: Graphics) => {
    const { imageFactory } = this;
    const { session } = this.game;
    const image = await imageFactory.getImage({ filename: BACKGROUND_FILENAME });
    const { screenWidth, screenHeight } = this.game.config;
    const left = screenWidth / 4;
    const top = screenHeight / 4;
    const width = screenWidth / 2;
    const height = screenHeight / 2;
    graphics.drawScaledImage(image, { left, top, width, height });

    const options = checkNotNull(session.getShrineMenuState()).options;

    let y = top + 10;
    const x = left + 10;

    const lines = ['You have found a shrine.', 'Choose a blessing:'];
    for (const line of lines) {
      this._drawText(
        line,
        FontName.APPLE_II,
        { x, y },
        Colors.WHITE,
        Alignment.LEFT,
        graphics
      );
      y += 20;
    }

    y += 20;

    for (const option of options) {
      const color = this._getOptionColor(option);
      this._drawText(
        option.label,
        FontName.APPLE_II,
        { x: x + 10, y },
        color,
        Alignment.LEFT,
        graphics
      );
      y += 20;
    }
  };

  private _getOptionColor = (option: ShrineOption): Color => {
    const { session } = this.game;
    const selectedOption = checkNotNull(session.getShrineMenuState()).getSelectedOption();
    const isSelected = selectedOption.label === option.label;
    return isSelected ? Colors.WHITE : Colors.LIGHT_GRAY;
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
