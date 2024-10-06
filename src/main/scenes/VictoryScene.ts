import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { Graphics } from '@lib/graphics/Graphics';
import { formatTimestamp } from '@lib/utils/time';
import { FontName } from '@main/graphics/Fonts';
import Colors from '@main/graphics/Colors';
import { Alignment, drawAligned } from '@main/graphics/RenderingUtils';
import { Pixel } from '@lib/geometry/Pixel';
import { Color } from '@lib/graphics/Color';
import { ClickCommand, KeyCommand, ModifierKey } from '@lib/input/inputTypes';
import { toggleFullScreen } from '@lib/utils/dom';
import { showTitleScreen } from '@main/actions/showTitleScreen';
import { Globals } from '@main/core/globals';

const BACKGROUND_FILENAME = 'victory2';

export class VictoryScene implements Scene {
  readonly name = SceneName.VICTORY;

  render = async (graphics: Graphics): Promise<void> => {
    const { session, imageFactory } = Globals;
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
    const { textRenderer } = Globals;
    const imageData = textRenderer.renderText({
      text,
      fontName,
      color,
      backgroundColor: Colors.BLACK
    });
    drawAligned(imageData, graphics, pixel, textAlign);
  };

  handleKeyDown = async (command: KeyCommand) => {
    const { session } = Globals;
    const { key, modifiers } = command;
    switch (key) {
      case 'ENTER':
        if (modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        } else {
          await this._restartGame();
        }
        break;
      case 'ESCAPE':
        session.setScene(SceneName.GAME);
    }
  };

  handleKeyUp = async () => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleClick = async (_: ClickCommand) => {
    await this._restartGame();
  };

  private _restartGame = async () => {
    const { state, session } = Globals;
    state.reset();
    session.reset();
    await showTitleScreen();
  };
}
