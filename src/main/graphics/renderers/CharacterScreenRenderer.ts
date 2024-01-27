import { Renderer } from './Renderer';
import Color from '../Color';
import Colors from '../Colors';
import { TextRenderer } from '../TextRenderer';
import { Alignment, drawAligned } from '../RenderingUtils';
import { Pixel } from '../Pixel';
import { Graphics } from '../Graphics';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { FontName } from '../Fonts';
import { Session } from '../../core/Session';

const BACKGROUND_FILENAME = 'inventory_background';
const LINE_HEIGHT = 15;

type Props = Readonly<{
  textRenderer: TextRenderer;
  graphics: Graphics;
}>;

export default class CharacterScreenRenderer implements Renderer {
  private readonly textRenderer: TextRenderer;
  private readonly graphics: Graphics;

  constructor({ textRenderer, graphics }: Props) {
    this.textRenderer = textRenderer;
    this.graphics = graphics;
  }

  /**
   * @override {@link Renderer#render}
   */
  render = async (session: Session) => {
    const { graphics } = this;
    const image = await session
      .getImageFactory()
      .getImage({ filename: BACKGROUND_FILENAME });
    graphics.drawScaledImage(image, {
      left: 0,
      top: 0,
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT
    });

    await this._renderStatistics(session);
  };

  private _renderStatistics = async (session: Session) => {
    const { graphics } = this;
    const playerUnit = session.getPlayerUnit();
    let top = 20;
    await this._drawText(
      'Character Statistics',
      FontName.APPLE_II,
      { x: graphics.getWidth() / 2, y: top },
      Colors.WHITE,
      Alignment.CENTER
    );

    top += 20;

    {
      const lines = [
        `Strength: ${playerUnit.getStrength()}`,
        `Dexterity: ${playerUnit.getDexterity()}`
      ];
      for (const line of lines) {
        await this._drawText(
          line,
          FontName.APPLE_II,
          { x: 20, y: top },
          Colors.WHITE,
          Alignment.LEFT
        );
        top += LINE_HEIGHT;
      }
    }

    top += 20;

    {
      const lines = [
        `Kills: ${playerUnit.getLifetimeKills()}`,
        `Damage Dealt: ${playerUnit.getLifetimeDamageDealt()}`,
        `Damage Taken: ${playerUnit.getLifetimeDamageTaken()}`,
        `Mana Spent: ${playerUnit.getLifetimeManaSpent()}`,
        `Steps Taken: ${playerUnit.getLifetimeStepsTaken()}`
      ];
      for (const line of lines) {
        await this._drawText(
          line,
          FontName.APPLE_II,
          { x: 20, y: top },
          Colors.WHITE,
          Alignment.LEFT
        );
        top += LINE_HEIGHT;
      }
    }
  };

  private _drawText = async (
    text: string,
    font: FontName,
    pixel: Pixel,
    color: Color,
    textAlign: Alignment
  ) => {
    const image = await this.textRenderer.renderText(text, font, color);
    drawAligned(image, this.graphics, pixel, textAlign);
  };
}
