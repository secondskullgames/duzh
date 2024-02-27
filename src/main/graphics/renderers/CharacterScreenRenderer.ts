import { Renderer } from './Renderer';
import { Color } from '../Color';
import { Colors } from '../Colors';
import { Pixel } from '../Pixel';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { FontName } from '../Fonts';
import { Graphics, Alignment, drawAligned, TextRenderer } from '@main/graphics';
import { ImageFactory } from '@main/graphics/images';
import { Session } from '@main/core';
import { inject, injectable } from 'inversify';

const BACKGROUND_FILENAME = 'inventory_background';
const LINE_HEIGHT = 15;

@injectable()
export class CharacterScreenRenderer implements Renderer {
  constructor(
    @inject(Session.SYMBOL)
    private readonly session: Session,
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer,
    @inject(ImageFactory)
    private readonly imageFactory: ImageFactory
  ) {}

  /**
   * @override {@link Renderer#render}
   */
  render = async (graphics: Graphics) => {
    const { imageFactory } = this;
    const image = await imageFactory.getImage({ filename: BACKGROUND_FILENAME });
    graphics.drawScaledImage(image, {
      left: 0,
      top: 0,
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT
    });

    await this._renderStatistics(graphics);
  };

  private _renderStatistics = async (graphics: Graphics) => {
    const { session } = this;
    const playerUnit = session.getPlayerUnit();
    let top = 20;
    await this._drawText(
      'Character Statistics',
      FontName.APPLE_II,
      { x: graphics.getWidth() / 2, y: top },
      Colors.WHITE,
      Alignment.CENTER,
      graphics
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
          Alignment.LEFT,
          graphics
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
          Alignment.LEFT,
          graphics
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
    textAlign: Alignment,
    graphics: Graphics
  ) => {
    const image = await this.textRenderer.renderText(text, font, color);
    drawAligned(image, graphics, pixel, textAlign);
  };
}
