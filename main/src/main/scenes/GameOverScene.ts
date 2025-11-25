import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import ImageFactory from '@lib/graphics/images/ImageFactory';
import { TextRenderer } from '@main/graphics/TextRenderer';
import { Graphics } from '@lib/graphics/Graphics';
import { FontName } from '@main/graphics/Fonts';
import { Alignment, drawAligned } from '@main/graphics/RenderingUtils';
import { Pixel } from '@duzh/geometry';
import { Color } from '@lib/graphics/Color';
import { ClickCommand, KeyCommand, ModifierKey } from '@lib/input/inputTypes';
import { toggleFullScreen } from '@lib/utils/dom';
import { showTitleScreen } from '@main/actions/showTitleScreen';
import { formatTimestamp } from '@lib/utils/time';
import { Game } from '@main/core/Game';
import { checkNotNull } from '@duzh/utils/preconditions';
import { InterfaceColors } from '@main/graphics/InterfaceColors';

const BACKGROUND_FILENAME = 'gameover';

export class GameOverScene implements Scene {
  readonly name = SceneName.GAME_OVER;

  constructor(
    private readonly imageFactory: ImageFactory,
    private readonly textRenderer: TextRenderer,
    private readonly game: Game
  ) {}

  render = async (graphics: Graphics): Promise<void> => {
    const { imageFactory } = this;
    const { state } = this.game;
    const gameOverState = checkNotNull(state.getGameOverState());
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
      `Died on level ${gameOverState.levelNumber}`,
      `in ${elapsedTurns} turns (${elapsedTime})`,
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

  handleKeyDown = async (command: KeyCommand) => {
    const { key, modifiers } = command;

    switch (key) {
      case 'ENTER':
        if (modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        } else {
          await showTitleScreen(this.game);
        }
        break;
    }
  };

  handleKeyUp = async () => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleClick = async (_: ClickCommand) => {
    await showTitleScreen(this.game);
  };
}
