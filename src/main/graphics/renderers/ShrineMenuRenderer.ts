import { Renderer } from './Renderer';
import { FontName } from '../Fonts';
import { Alignment, drawAligned } from '../RenderingUtils';
import Colors from '../Colors';
import { Pixel } from '@lib/geometry/Pixel';
import { Graphics } from '@lib/graphics/Graphics';
import { Color } from '@lib/graphics/Color';
import { checkNotNull } from '@lib/utils/preconditions';
import { ShrineOption } from '@main/core/state/ShrineMenuState';
import { Game } from '@main/core/Game';

const BACKGROUND_FILENAME = 'bordered_background';

export class ShrineMenuRenderer implements Renderer {
  render = async (game: Game, graphics: Graphics) => {
    const { state, imageFactory } = game;
    const image = await imageFactory.getImage({ filename: BACKGROUND_FILENAME });
    const { screenWidth, screenHeight } = game.config;
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
        Colors.WHITE,
        Alignment.LEFT,
        graphics,
        game
      );
      y += 20;
    }

    y += 20;

    for (const option of options) {
      const color = this._getOptionColor(option, game);
      this._drawText(
        option.label,
        FontName.APPLE_II,
        { x: x + 10, y },
        color,
        Alignment.LEFT,
        graphics,
        game
      );
      y += 20;
    }
  };

  private _getOptionColor = (option: ShrineOption, game: Game): Color => {
    const { state } = game;
    const selectedOption = checkNotNull(state.getShrineMenuState()).getSelectedOption();
    const isSelected = selectedOption.label === option.label;
    return isSelected ? Colors.WHITE : Colors.LIGHT_GRAY;
  };

  private _drawText = (
    text: string,
    fontName: FontName,
    pixel: Pixel,
    color: Color,
    textAlign: Alignment,
    graphics: Graphics,
    game: Game
  ) => {
    const imageData = game.textRenderer.renderText({
      text,
      fontName,
      color,
      backgroundColor: Colors.BLACK
    });
    drawAligned(imageData, graphics, pixel, textAlign);
  };
}
