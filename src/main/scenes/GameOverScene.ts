import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import ImageFactory from '@lib/graphics/images/ImageFactory';
import { TextRenderer } from '@main/graphics/TextRenderer';
import { Graphics } from '@lib/graphics/Graphics';
import { FontName } from '@main/graphics/Fonts';
import Colors from '@main/graphics/Colors';
import { Alignment, drawAligned } from '@main/graphics/RenderingUtils';
import { Pixel } from '@lib/geometry/Pixel';
import { Color } from '@lib/graphics/Color';
import { ClickCommand, KeyCommand, ModifierKey } from '@lib/input/inputTypes';
import { toggleFullScreen } from '@lib/utils/dom';
import { showSplashScreen } from '@main/actions/showSplashScreen';
import { Engine } from '@main/core/Engine';
import { inject, injectable } from 'inversify';

const BACKGROUND_FILENAME = 'gameover';

@injectable()
export class GameOverScene implements Scene {
  readonly name = SceneName.GAME_OVER;

  constructor(
    @inject(ImageFactory)
    private readonly imageFactory: ImageFactory,
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer,
    @inject(Engine)
    private readonly engine: Engine
  ) {}

  render = async (graphics: Graphics): Promise<void> => {
    const image = await this.imageFactory.getImage({ filename: BACKGROUND_FILENAME });
    graphics.drawScaledImage(image, {
      left: 0,
      top: 0,
      width: graphics.getWidth(),
      height: graphics.getHeight()
    });
    this._drawText(
      'PRESS ENTER TO PLAY AGAIN',
      FontName.APPLE_II,
      { x: 320, y: 300 },
      Colors.WHITE,
      Alignment.CENTER,
      graphics
    );
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

  handleKeyDown = async (command: KeyCommand) => {
    const { engine } = this;
    const session = engine.getSession();
    const state = engine.getState();
    const { key, modifiers } = command;

    switch (key) {
      case 'ENTER':
        if (modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        } else {
          state.reset();
          session.reset();
          await showSplashScreen(state, session);
        }
        break;
    }
  };

  handleKeyUp = async () => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleClick = async (_: ClickCommand) => {
    const { engine } = this;
    const session = engine.getSession();
    const state = engine.getState();
    state.reset();
    session.reset();
    await showSplashScreen(state, session);
  };
}
