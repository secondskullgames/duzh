import { Renderer } from './Renderer';
import { FontName } from '../Fonts';
import { Alignment, drawAligned } from '../RenderingUtils';
import Colors from '../Colors';
import { Pixel } from '@lib/geometry/Pixel';
import { Graphics } from '@lib/graphics/Graphics';
import { Color } from '@lib/graphics/Color';
import { checkNotNull } from '@lib/utils/preconditions';
import { ShrineOption } from '@main/core/session/ShrineMenuState';
import { Globals } from '@main/core/globals';

const BACKGROUND_FILENAME = 'bordered_background';

export class ShrineMenuRenderer implements Renderer {
  render = async (graphics: Graphics) => {
    const { imageFactory, session, gameConfig } = Globals;
    const { screenWidth, screenHeight } = gameConfig;
    const image = await imageFactory.getImage({ filename: BACKGROUND_FILENAME });
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
    const { session } = Globals;
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
    const { textRenderer } = Globals;
    const imageData = textRenderer.renderText({
      text,
      fontName,
      color,
      backgroundColor: Colors.BLACK
    });
    drawAligned(imageData, graphics, pixel, textAlign);
  };
}
