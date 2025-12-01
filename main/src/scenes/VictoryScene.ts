import { Pixel } from '@duzh/geometry';
import { Color, Graphics } from '@duzh/graphics';
import { ImageFactory } from '@duzh/graphics/images';
import { ClickCommand, KeyCommand, ModifierKey } from '@main/input/inputTypes';
import { toggleFullScreen } from '@main/utils/dom';
import { formatTimestamp } from '@main/utils/time';
import { Game } from '@main/core/Game';
import { FontName } from '@main/graphics/Fonts';
import { InterfaceColors } from '@main/graphics/InterfaceColors';
import { Alignment, drawAligned } from '@main/graphics/RenderingUtils';
import { TextRenderer } from '@main/graphics/TextRenderer';
import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { GameController } from '../controllers/GameController';

const BACKGROUND_FILENAME = 'victory2';

export class VictoryScene implements Scene {
  readonly name = SceneName.VICTORY;

  constructor(
    private readonly game: Game,
    private readonly gameController: GameController,
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

  handleKeyDown = async (command: KeyCommand) => {
    const { state } = this.game;
    const { key, modifiers } = command;
    switch (key) {
      case 'ENTER':
        if (modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        } else {
          await this.gameController.showTitleScene(this.game);
        }
        break;
      case 'ESCAPE':
        state.setScene(SceneName.GAME);
    }
  };

  handleKeyUp = async () => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleClick = async (_: ClickCommand) => {
    await this.gameController.showTitleScene(this.game);
  };
}
