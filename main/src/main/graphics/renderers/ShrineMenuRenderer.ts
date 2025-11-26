import { Renderer } from './Renderer';
import { FontName } from '../Fonts';
import { Alignment, drawAligned } from '../RenderingUtils';
import { TextRenderer } from '../TextRenderer';
import { Pixel } from '@duzh/geometry';
import { Color, Graphics } from '@duzh/graphics';
import { ImageFactory } from '@duzh/graphics/images';
import { checkNotNull } from '@duzh/utils/preconditions';
import { ShrineOption } from '@main/core/state/ShrineMenuState';
import { Game } from '@main/core/Game';
import { InterfaceColors } from '@main/graphics/InterfaceColors';

const BACKGROUND_FILENAME = 'bordered_background';

export class ShrineMenuRenderer implements Renderer {
  constructor(
    private readonly game: Game,
    private readonly textRenderer: TextRenderer,
    private readonly imageFactory: ImageFactory
  ) {}

  render = async (graphics: Graphics) => {
    const { imageFactory } = this;
    const { state } = this.game;
    const image = await imageFactory.getImage({ filename: BACKGROUND_FILENAME });
    const { screenWidth, screenHeight } = this.game.config;
    const left = screenWidth / 4;
    const top = screenHeight / 4;
    const width = screenWidth / 2;
    const height = screenHeight / 2;
    graphics.drawScaledImage(image, { left, top, width, height });

    const options = checkNotNull(state.getShrineMenuState()).options;

    let y = top + 10;
    const x = left + 10;

    const lines = ['You have found a shrine.', 'Choose a blessing:'];
    for (const line of lines) {
      this._drawText(
        line,
        FontName.APPLE_II,
        { x, y },
        InterfaceColors.WHITE,
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
    const { state } = this.game;
    const selectedOption = checkNotNull(state.getShrineMenuState()).getSelectedOption();
    const isSelected = selectedOption.label === option.label;
    return isSelected ? InterfaceColors.WHITE : InterfaceColors.LIGHT_GRAY;
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
