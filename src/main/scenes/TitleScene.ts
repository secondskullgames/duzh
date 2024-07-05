import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { Session } from '@main/core/Session';
import { MapController } from '@main/maps/MapController';
import { ClickCommand, KeyCommand, ModifierKey } from '@lib/input/inputTypes';
import { isMobileDevice, toggleFullScreen } from '@lib/utils/dom';
import { Feature } from '@main/utils/features';
import ImageFactory from '@lib/graphics/images/ImageFactory';
import { TextRenderer } from '@main/graphics/TextRenderer';
import { Graphics } from '@lib/graphics/Graphics';
import { FontName } from '@main/graphics/Fonts';
import Colors from '@main/graphics/Colors';
import { Alignment, drawAligned } from '@main/graphics/RenderingUtils';
import { Pixel } from '@lib/geometry/Pixel';
import { Color } from '@lib/graphics/Color';
import { inject, injectable } from 'inversify';

const TITLE_FILENAME = 'title2';

@injectable()
export class TitleScene implements Scene {
  readonly name = SceneName.TITLE;

  constructor(
    @inject(Session)
    private readonly session: Session,
    @inject(MapController)
    private readonly mapController: MapController,
    @inject(ImageFactory)
    private readonly imageFactory: ImageFactory,
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer
  ) {}

  private _handleStartGame = async () => {
    const { session, mapController } = this;
    if (Feature.isEnabled(Feature.DEBUG_LEVEL)) {
      await mapController.loadDebugMap();
    } else {
      await mapController.loadFirstMap();
    }
    session.startGameTimer();
    session.setScene(SceneName.GAME);
    session
      .getTicker()
      .log('Welcome to the Dungeons of Duzh!', { turn: session.getTurn() });
    if (isMobileDevice()) {
      session
        .getTicker()
        .log('Press the ? icon in the upper-right for instructions.', {
          turn: session.getTurn()
        });
    } else {
      session.getTicker().log('Press F1 for instructions.', { turn: session.getTurn() });
    }
  };

  handleKeyDown = async (command: KeyCommand) => {
    const { key, modifiers } = command;

    switch (key) {
      case 'ENTER':
        if (modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        } else {
          await this._handleStartGame();
        }
        break;
    }
  };

  handleKeyUp = async () => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleClick = async (_: ClickCommand) => {
    await this._handleStartGame();
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
        Colors.WHITE,
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
      backgroundColor: Colors.BLACK
    });
    drawAligned(imageData, graphics, pixel, textAlign);
  };
}
