import { Color, Graphics } from '@duzh/graphics';
import { isMobileDevice } from '@main/utils/dom';
import { FontName } from '@main/graphics/Fonts';
import { Pixel } from '@duzh/geometry';
import { Alignment, drawAligned } from '@main/graphics/RenderingUtils';
import { LINE_HEIGHT } from '@main/graphics/constants';
import { TextRenderer } from '@main/graphics/TextRenderer';
import { Game } from '@main/core/Game';
import { InterfaceColors } from '@main/graphics/InterfaceColors';
import { ImageFactory } from '@duzh/graphics/images';
import { Renderer } from './Renderer';

const BACKGROUND_FILENAME = 'bordered_background';

export class HelpSceneRenderer implements Renderer {
  constructor(
    private readonly game: Game,
    private readonly textRenderer: TextRenderer,
    private readonly imageFactory: ImageFactory
  ) {}

  render = async (graphics: Graphics) => {
    const { imageFactory } = this;
    const image = await imageFactory.getImage({ filename: BACKGROUND_FILENAME });
    graphics.drawScaledImage(image, {
      left: 0,
      top: 0,
      width: this.game.config.screenWidth,
      height: this.game.config.screenHeight
    });

    const left = 10;
    const top = 10;

    const intro = [
      'Welcome to the Dungeons of Duzh! To escape, you must brave untold',
      'terrors on eight floors. Make use of every weapon available, hone',
      'your skills through combat, and beware the Horned Wizard.'
    ];

    for (let i = 0; i < intro.length; i++) {
      const y = top + LINE_HEIGHT * i;
      this._drawText(
        intro[i],
        FontName.APPLE_II,
        { x: left, y },
        InterfaceColors.WHITE,
        Alignment.LEFT,
        graphics
      );
    }

    if (isMobileDevice()) {
      this._printMobileInstructions(graphics, {
        x: left,
        y: top + (intro.length + 2) * LINE_HEIGHT
      });
    } else {
      this._printKeyboardInstructions(graphics, {
        x: left,
        y: top + (intro.length + 2) * LINE_HEIGHT
      });
    }
  };

  private _printKeyboardInstructions = (
    graphics: Graphics,
    { x: left, y: top }: Pixel
  ) => {
    const keys: [string, string][] = [
      ['WASD / Arrow keys', 'Move around, melee attack'],
      ['Tab', 'Open inventory screen'],
      ['Enter', 'Pick up item, enter portal, go down stairs'],
      ['Number keys (1-9)', 'Special moves (press arrow to execute)'],
      ['Shift + (direction)', 'Use bow and arrows'],
      ['Alt + (direction)', 'Dash'],
      ['M', 'View map screen'],
      ['C', 'View character screen'],
      ['F1', 'View this screen']
    ];

    for (let i = 0; i < keys.length; i++) {
      const y = top + LINE_HEIGHT * i;
      const [key, description] = keys[i];
      this._drawText(
        key,
        FontName.APPLE_II,
        { x: left, y },
        InterfaceColors.WHITE,
        Alignment.LEFT,
        graphics
      );
      this._drawText(
        description,
        FontName.APPLE_II,
        { x: left + 200, y },
        InterfaceColors.WHITE,
        Alignment.LEFT,
        graphics
      );
    }
  };

  private _printMobileInstructions = (graphics: Graphics, { x: left, y: top }: Pixel) => {
    const keys: [string, string][] = [
      ['Click on current tile', 'Pick up item, enter portal, go down stairs'],
      ['Click on adjacent tiles', 'Move around, melee attack'],
      ['Action buttons', 'Special moves (click adjacent tile to use)'],
      ['"I" menu button', 'Open inventory screen'],
      ['"M" menu button', 'View map screen'],
      ['"C" menu button', 'View character screen'],
      ['"?" menu button', 'View this screen']
    ];

    for (let i = 0; i < keys.length; i++) {
      const y = top + LINE_HEIGHT * i;
      const [key, description] = keys[i];
      this._drawText(
        key,
        FontName.APPLE_II,
        { x: left, y },
        InterfaceColors.WHITE,
        Alignment.LEFT,
        graphics
      );
      this._drawText(
        description,
        FontName.APPLE_II,
        { x: left + 225, y },
        InterfaceColors.WHITE,
        Alignment.LEFT,
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
