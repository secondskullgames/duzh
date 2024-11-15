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
import { Game } from '@main/core/Game';

const BACKGROUND_FILENAME = 'victory2';

export class VictoryScene implements Scene {
  readonly name = SceneName.VICTORY;

  constructor() {}

  render = async (game: Game, graphics: Graphics): Promise<void> => {
    const { state, imageFactory } = game;
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
        Colors.WHITE,
        Alignment.CENTER,
        graphics,
        game
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

  handleKeyDown = async (command: KeyCommand, game: Game) => {
    const { state } = game;
    const { key, modifiers } = command;
    switch (key) {
      case 'ENTER':
        if (modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        } else {
          await showTitleScreen(game);
        }
        break;
      case 'ESCAPE':
        state.setScene(SceneName.GAME);
    }
  };

  handleKeyUp = async () => {};

  handleClick = async (_: ClickCommand, game: Game) => {
    await showTitleScreen(game);
  };
}
