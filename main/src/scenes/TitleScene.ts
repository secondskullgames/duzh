import { Pixel } from '@duzh/geometry';
import { Color, Graphics } from '@duzh/graphics';
import { ImageFactory } from '@duzh/graphics/images';
import { GameController } from '@main/controllers/GameController';
import { Game } from '@main/core/Game';
import { FontName } from '@main/graphics/Fonts';
import { InterfaceColors } from '@main/graphics/InterfaceColors';
import { Alignment, drawAligned } from '@main/graphics/RenderingUtils';
import { TextRenderer } from '@main/graphics/TextRenderer';
import { ClickCommand, KeyCommand, ModifierKey } from '@main/input/inputTypes';
import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { toggleFullScreen } from '@main/utils/dom';

const TITLE_FILENAME = 'title2';

export class TitleScene implements Scene {
  readonly name = SceneName.TITLE;

  constructor(
    private readonly game: Game,
    private readonly gameController: GameController,
    private readonly imageFactory: ImageFactory,
    private readonly textRenderer: TextRenderer
  ) {}

  handleKeyDown = async (command: KeyCommand) => {
    const { key, modifiers } = command;

    switch (key) {
      case 'ENTER':
        if (modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        } else {
          await this.gameController.handleStartGame(this.game);
        }
        break;
    }
  };

  handleKeyUp = async () => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleClick = async (_: ClickCommand) => {
    await this.gameController.handleStartGame(this.game);
  };

  render = async (graphics: Graphics): Promise<void> => {
    const image = await this.imageFactory.getImage({ filename: TITLE_FILENAME });
    graphics.drawScaledImage(image, {
      left: 0,
      top: 0,
      width: graphics.getWidth(),
      height: graphics.getHeight()
    });
    const halfSeconds = Math.floor(new Date().getTime() / 500);
    if (halfSeconds % 2 === 0) {
      this._drawText(
        'PRESS ENTER TO BEGIN',
        FontName.APPLE_II,
        { x: 320, y: 300 },
        InterfaceColors.WHITE,
        Alignment.CENTER,
        graphics
      );
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
