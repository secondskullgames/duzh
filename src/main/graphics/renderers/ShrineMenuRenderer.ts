import { Renderer } from './Renderer';
import { FontName } from '../Fonts';
import { Alignment, drawAligned } from '../RenderingUtils';
import { TextRenderer } from '../TextRenderer';
import Colors from '../Colors';
import { Pixel } from '@lib/geometry/Pixel';
import { Graphics } from '@lib/graphics/Graphics';
import { Session } from '@main/core/Session';
import { GameConfig } from '@main/core/GameConfig';
import ImageFactory from '@lib/graphics/images/ImageFactory';
import { Color } from '@lib/graphics/Color';
import { checkNotNull } from '@lib/utils/preconditions';
import { ShrineOption } from '@main/core/session/ShrineMenuState';
import { inject, injectable } from 'inversify';

// TODO correctly sized background
const BACKGROUND_FILENAME = 'inventory_background';

@injectable()
export class ShrineMenuRenderer implements Renderer {
  constructor(
    @inject(GameConfig)
    private readonly gameConfig: GameConfig,
    @inject(Session)
    private readonly session: Session,
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer,
    @inject(ImageFactory)
    private readonly imageFactory: ImageFactory
  ) {}

  render = async (graphics: Graphics) => {
    const { imageFactory, gameConfig, session } = this;
    const image = await imageFactory.getImage({ filename: BACKGROUND_FILENAME });
    const { screenWidth, screenHeight } = gameConfig;
    const left = screenWidth / 4;
    const top = screenHeight / 4;
    graphics.drawScaledImage(image, {
      left,
      top,
      width: screenWidth / 2,
      height: screenHeight / 2
    });

    const options = checkNotNull(session.getShrineMenuState()).options;

    let y = top + 10;
    const x = left + 20;

    for (const option of options) {
      const color = this._getOptionColor(option);
      await this._drawText(
        option.label,
        FontName.APPLE_II,
        { x, y },
        color,
        Alignment.LEFT,
        graphics
      );
      y += 20;
    }
  };

  private _getOptionColor = (option: ShrineOption): Color => {
    const selectedOption = checkNotNull(
      this.session.getShrineMenuState()
    ).getSelectedOption();
    const isSelected = selectedOption.label === option.label;
    return isSelected ? Colors.WHITE : Colors.LIGHT_GRAY;
  };

  private _drawText = async (
    text: string,
    font: FontName,
    pixel: Pixel,
    color: Color,
    textAlign: Alignment,
    graphics: Graphics
  ) => {
    const image = await this.textRenderer.renderText(text, font, color);
    drawAligned(image, graphics, pixel, textAlign);
  };
}
