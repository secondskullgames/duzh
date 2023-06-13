import Colors from '../Colors';
import { LINE_HEIGHT, SCREEN_WIDTH } from '../constants';
import { FontName } from '../Fonts';
import { Alignment, drawAligned } from '../RenderingUtils';
import GameState from '../../core/GameState';
import ImageFactory from '../images/ImageFactory';
import { TextRenderer } from '../TextRenderer';
import { Graphics } from '../Graphics';
import { Renderer } from './Renderer';
import { Pixel } from '../Pixel';
import Color from '../Color';

type Props = Readonly<{
  state: GameState,
  imageFactory: ImageFactory,
  textRenderer: TextRenderer,
  graphics: Graphics
}>;

export default class HelpScreenRenderer implements Renderer {
  private readonly state: GameState;
  private readonly imageFactory: ImageFactory;
  private readonly textRenderer: TextRenderer;
  private readonly graphics: Graphics;

  constructor({ state, imageFactory, textRenderer, graphics }: Props) {
    this.state = state;
    this.imageFactory = imageFactory;
    this.textRenderer = textRenderer;
    this.graphics = graphics;
  }

  render = async () => {
    this.graphics.fill(Colors.BLACK);

    const left = 4;
    const top = 4;

    const intro = [
      'Welcome to the Dungeon of Duzh! To escape, you must brave untold',
      'terrors on seven floors. Make use of every weapon available, hone',
      'your skills through combat, and beware the Horned Wizard.'
    ];

    const keys: [string, string][] = [
      ['WASD / Arrow keys',   'Move around, melee attack'],
      ['Tab',                 'Open inventory screen'],
      ['Enter',               'Pick up item, enter portal, go down stairs'],
      ['Number keys (1-9)',   'Special moves (press arrow to execute)'],
      ['Shift + (direction)', 'Use bow and arrows'],
      ['Alt + (direction)',   'Strafe'],
      ['M',                   'View map screen'],
      ['C',                   'View character screen'],
      ['F1',                  'View this screen']
    ];

    for (let i = 0; i < intro.length; i++) {
      const y = top + (LINE_HEIGHT * i);
      await this._drawText(intro[i], FontName.APPLE_II, { x: left, y }, Colors.WHITE, Alignment.LEFT);
    }

    for (let i = 0; i < keys.length; i++) {
      const y = top + (LINE_HEIGHT * (i + intro.length + 2));
      this.graphics.fillRect({ left, top: y, width: SCREEN_WIDTH, height: LINE_HEIGHT }, Colors.BLACK);
      const [key, description] = keys[i];
      await this._drawText(key, FontName.APPLE_II, { x: left, y }, Colors.WHITE, Alignment.LEFT);
      await this._drawText(description, FontName.APPLE_II, { x: left + 200, y }, Colors.WHITE, Alignment.LEFT);
    }
  };

  private _drawText = async (text: string, font: FontName, pixel: Pixel, color: Color, textAlign: Alignment) => {
    const image = await this.textRenderer.renderText(text, font, color);
    drawAligned(image, this.graphics, pixel, textAlign);
  };
}