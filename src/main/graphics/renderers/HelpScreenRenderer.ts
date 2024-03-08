import { Renderer } from './Renderer';
import { LINE_HEIGHT } from '../constants';
import { FontName } from '../Fonts';
import { Alignment, drawAligned } from '../RenderingUtils';
import { TextRenderer } from '../TextRenderer';
import Colors from '../Colors';
import { Graphics } from '@lib/graphics/Graphics';
import { Pixel } from '@lib/geometry/Pixel';
import { GameConfig } from '@main/core/GameConfig';
import { Color } from '@lib/graphics/Color';
import { inject, injectable } from 'inversify';

@injectable()
export default class HelpScreenRenderer implements Renderer {
  constructor(
    @inject(GameConfig)
    private readonly gameConfig: GameConfig,
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer
  ) {}

  render = async (graphics: Graphics) => {
    graphics.fill(Colors.BLACK);

    const left = 4;
    const top = 4;

    const intro = [
      'Welcome to the Dungeons of Duzh! To escape, you must brave untold',
      'terrors on eight floors. Make use of every weapon available, hone',
      'your skills through combat, and beware the Horned Wizard.'
    ];

    const keys: [string, string][] = [
      ['WASD / Arrow keys', 'Move around, melee attack'],
      ['Tab', 'Open inventory screen'],
      ['Enter', 'Pick up item, enter portal, go down stairs'],
      ['Number keys (1-9)', 'Special moves (press arrow to execute)'],
      ['Shift + (direction)', 'Use bow and arrows'],
      ['Alt + (direction)', 'Strafe'],
      ['M', 'View map screen'],
      ['C', 'View character screen'],
      ['F1', 'View this screen']
    ];

    for (let i = 0; i < intro.length; i++) {
      const y = top + LINE_HEIGHT * i;
      await this._drawText(
        intro[i],
        FontName.APPLE_II,
        { x: left, y },
        Colors.WHITE,
        Alignment.LEFT,
        graphics
      );
    }

    for (let i = 0; i < keys.length; i++) {
      const y = top + LINE_HEIGHT * (i + intro.length + 2);
      graphics.fillRect(
        { left, top: y, width: this.gameConfig.screenWidth, height: LINE_HEIGHT },
        Colors.BLACK
      );
      const [key, description] = keys[i];
      await this._drawText(
        key,
        FontName.APPLE_II,
        { x: left, y },
        Colors.WHITE,
        Alignment.LEFT,
        graphics
      );
      await this._drawText(
        description,
        FontName.APPLE_II,
        { x: left + 200, y },
        Colors.WHITE,
        Alignment.LEFT,
        graphics
      );
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
