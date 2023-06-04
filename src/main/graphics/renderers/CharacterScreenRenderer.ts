import GameState from '../../core/GameState';
import Color from '../Color';
import Colors from '../Colors';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { FontDefinition, FontRenderer } from '../FontRenderer';
import ImageFactory from '../images/ImageFactory';
import { Alignment, drawAligned } from '../RenderingUtils';
import Fonts from '../Fonts';
import { Renderer } from './Renderer';
import { Pixel } from '../Pixel';

const MARGIN = 10;

const BACKGROUND_FILENAME = 'inventory_background';

type Props = Readonly<{
  state: GameState,
  imageFactory: ImageFactory,
  fontRenderer: FontRenderer,
  context: CanvasRenderingContext2D
}>;

const LINE_HEIGHT = 10;
export default class CharacterScreenRenderer implements Renderer {
  private readonly state: GameState;
  private readonly imageFactory: ImageFactory;
  private readonly fontRenderer: FontRenderer;
  private readonly context: CanvasRenderingContext2D;

  constructor({ state, imageFactory, fontRenderer, context }: Props) {
    this.state = state;
    this.imageFactory = imageFactory;
    this.fontRenderer = fontRenderer;
    this.context = context;
  }

  /**
   * @override {@link Renderer#render}
   */
  render = async () => {
    const { context, state } = this;
    const { canvas } = context;
    const playerUnit = state.getPlayerUnit();

    const image = await this.imageFactory.getImage({ filename: BACKGROUND_FILENAME });
    context.drawImage(image.bitmap, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    let top = 20;
    await this._drawText('Character Statistics', Fonts.APPLE_II, { x: canvas.width / 2, y: top }, Colors.WHITE, Alignment.CENTER);
    top += 20;
    const lines = [
      `Kills: ${playerUnit.getLifetimeKills()}`,
      `Damage Dealt: ${playerUnit.getLifetimeDamageDealt()}`,
      `Damage Taken: ${playerUnit.getLifetimeDamageTaken()}`,
      `Mana Spent: ${playerUnit.getLifetimeManaSpent()}`,
      `Steps Taken: ${playerUnit.getLifetimeStepsTaken()}`
    ];
    for (const line of lines) {
      await this._drawText(line, Fonts.APPLE_II, { x: 20, y: top }, Colors.WHITE, Alignment.LEFT);
      top += LINE_HEIGHT;
    }
  }

  private _drawText = async (text: string, font: FontDefinition, pixel: Pixel, color: Color, textAlign: Alignment) => {
    const imageBitmap = await this.fontRenderer.renderText(text, font, color);
    drawAligned(imageBitmap, this.context, pixel, textAlign);
  };
}
