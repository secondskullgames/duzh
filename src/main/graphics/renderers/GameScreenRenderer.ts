import { Renderer } from './Renderer';
import Colors from '../Colors';
import { LINE_HEIGHT } from '../constants';
import { TextRenderer } from '../TextRenderer';
import { Alignment, drawAligned } from '../RenderingUtils';
import { FontName } from '../Fonts';
import { Graphics } from '@lib/graphics/Graphics';
import { isMobileDevice } from '@lib/utils/dom';
import { Feature } from '@main/utils/features';
import { Session } from '@main/core/Session';
import GameScreenViewportRenderer from '@main/graphics/renderers/GameScreenViewportRenderer';
import HUDRenderer from '@main/graphics/renderers/HUDRenderer';
import { Color } from '@lib/graphics/Color';
import TopMenuRenderer from '@main/graphics/renderers/TopMenuRenderer';
import { Pixel } from '@lib/geometry/Pixel';
import { inject, injectable } from 'inversify';

@injectable()
export default class GameScreenRenderer implements Renderer {
  constructor(
    @inject(Session)
    private readonly session: Session,
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer,
    @inject(GameScreenViewportRenderer)
    private readonly viewportRenderer: Renderer,
    @inject(HUDRenderer)
    private readonly hudRenderer: Renderer,
    @inject(TopMenuRenderer)
    private readonly topMenuRenderer: Renderer
  ) {
    this.textRenderer = textRenderer;
  }

  /**
   * @override {@link Renderer#render}
   */
  render = async (graphics: Graphics) => {
    graphics.fillRect(
      {
        left: 0,
        top: 0,
        width: graphics.getWidth(),
        height: graphics.getHeight()
      },
      Colors.BLACK
    );

    await this.viewportRenderer.render(graphics);
    await this.hudRenderer.render(graphics);
    await this._renderTicker(graphics);

    if (isMobileDevice()) {
      await this.topMenuRenderer.render(graphics);
    }

    if (Feature.isEnabled(Feature.BUSY_INDICATOR)) {
      if (this.session.isTurnInProgress()) {
        this._drawTurnProgressIndicator(graphics);
      }
    }
  };

  private _renderTicker = async (graphics: Graphics) => {
    const { session } = this;
    const messages = session.getTicker().getRecentMessages(session.getTurn());

    const left = 0;
    const top = 0;

    for (let i = 0; i < messages.length; i++) {
      const y = top + LINE_HEIGHT * i;
      graphics.fillRect(
        { left, top: y, width: graphics.getWidth(), height: LINE_HEIGHT },
        Colors.BLACK
      );
      this._drawText(
        messages[i],
        FontName.APPLE_II,
        { x: left, y: y + 2 },
        Colors.WHITE,
        Alignment.LEFT,
        graphics
      );
    }
  };

  private _drawTurnProgressIndicator = (graphics: Graphics) => {
    if (this.session.isTurnInProgress()) {
      const width = 20;
      const height = 20;
      const left = graphics.getWidth() - width;
      const top = 0;
      const rect = { left, top, width, height };
      graphics.fillRect(rect, Colors.DARK_GRAY);
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
