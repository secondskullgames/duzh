import { Feature } from '@duzh/features';
import { Pixel } from '@duzh/geometry';
import { Color, Graphics } from '@duzh/graphics';
import { Game } from '@main/core/Game';
import { isMobileDevice } from '@main/utils/dom';
import { LINE_HEIGHT } from '../constants';
import { FontName } from '../Fonts';
import { InterfaceColors } from '../InterfaceColors';
import { Alignment, drawAligned } from '../RenderingUtils';
import { TextRenderer } from '../TextRenderer';
import { Renderer } from './Renderer';

export class GameSceneRenderer implements Renderer {
  constructor(
    private readonly game: Game,
    private readonly textRenderer: TextRenderer,
    private readonly viewportRenderer: Renderer,
    private readonly hudRenderer: Renderer,
    private readonly topMenuRenderer: Renderer
  ) {}

  render = async (graphics: Graphics) => {
    const { state } = this.game;
    graphics.fillRect(
      {
        left: 0,
        top: 0,
        width: graphics.getWidth(),
        height: graphics.getHeight()
      },
      InterfaceColors.BLACK
    );

    await this.viewportRenderer.render(graphics);
    await this.hudRenderer.render(graphics);
    await this._renderTicker(graphics);

    if (isMobileDevice()) {
      await this.topMenuRenderer.render(graphics);
    }

    if (Feature.isEnabled(Feature.BUSY_INDICATOR)) {
      if (state.isTurnInProgress()) {
        this._drawTurnProgressIndicator(graphics);
      }
    }
  };

  private _renderTicker = async (graphics: Graphics) => {
    const { state, ticker } = this.game;
    const messages = ticker.getRecentMessages(state.getTurn());

    const left = 0;
    const top = 0;

    for (let i = 0; i < messages.length; i++) {
      const y = top + LINE_HEIGHT * i;
      graphics.fillRect(
        { left, top: y, width: graphics.getWidth(), height: LINE_HEIGHT },
        InterfaceColors.BLACK
      );
      this._drawText(
        messages[i],
        FontName.APPLE_II,
        { x: left, y: y + 2 },
        InterfaceColors.WHITE,
        Alignment.LEFT,
        graphics
      );
    }
  };

  private _drawTurnProgressIndicator = (graphics: Graphics) => {
    const { state } = this.game;
    if (state.isTurnInProgress()) {
      const width = 20;
      const height = 20;
      const left = graphics.getWidth() - width;
      const top = 0;
      const rect = { left, top, width, height };
      graphics.fillRect(rect, InterfaceColors.DARK_GRAY);
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
