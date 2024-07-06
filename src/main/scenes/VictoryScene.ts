import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { TextRenderer } from '@main/graphics/TextRenderer';
import ImageFactory from '@lib/graphics/images/ImageFactory';
import { Graphics } from '@lib/graphics/Graphics';
import { formatTimestamp } from '@lib/utils/time';
import { FontName } from '@main/graphics/Fonts';
import Colors from '@main/graphics/Colors';
import { Alignment, drawAligned } from '@main/graphics/RenderingUtils';
import { Pixel } from '@lib/geometry/Pixel';
import { Color } from '@lib/graphics/Color';
import { ClickCommand, KeyCommand, ModifierKey } from '@lib/input/inputTypes';
import { toggleFullScreen } from '@lib/utils/dom';
import { showSplashScreen } from '@main/actions/showSplashScreen';
import { inject, injectable } from 'inversify';

const BACKGROUND_FILENAME = 'victory2';

@injectable()
export class VictoryScene implements Scene {
  readonly name = SceneName.VICTORY;

  constructor(
    @inject(Session)
    private readonly session: Session,
    @inject(GameState)
    private readonly state: GameState,
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer,
    @inject(ImageFactory)
    private readonly imageFactory: ImageFactory
  ) {}

  render = async (graphics: Graphics): Promise<void> => {
    const { session, imageFactory } = this;
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
    const imageData = this.textRenderer.renderText({
      text,
      fontName,
      color,
      backgroundColor: Colors.BLACK
    });
    drawAligned(imageData, graphics, pixel, textAlign);
  };

  handleKeyDown = async (command: KeyCommand) => {
    const { state, session } = this;
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
      case 'ESCAPE':
        session.setScene(SceneName.GAME);
    }
  };

  handleKeyUp = async () => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleClick = async (_: ClickCommand) => {
    const { state, session } = this;
    state.reset();
    session.reset();
    await showSplashScreen(state, session);
  };
}
