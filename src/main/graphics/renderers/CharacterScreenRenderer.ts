import GameState from '../../core/GameState';
import Color from '../Color';
import Colors from '../Colors';
import { TextRenderer } from '../TextRenderer';
import ImageFactory from '../images/ImageFactory';
import { Alignment, drawAligned } from '../RenderingUtils';
import { Renderer } from './Renderer';
import { Pixel } from '../Pixel';
import { Graphics } from '../Graphics';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { FontName } from '../Fonts';

const BACKGROUND_FILENAME = 'inventory_background';
const LINE_HEIGHT = 10;

type Props = Readonly<{
  state: GameState,
  imageFactory: ImageFactory,
  textRenderer: TextRenderer,
  graphics: Graphics
}>;

export default class CharacterScreenRenderer implements Renderer {
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

  /**
   * @override {@link Renderer#render}
   */
  render = async () => {
    const { graphics, state } = this;
    const playerUnit = state.getPlayerUnit();

    const image = await this.imageFactory.getImage({ filename: BACKGROUND_FILENAME });
    graphics.drawScaledImage(image, {
      left: 0,
      top: 0,
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT
    });

    let top = 20;
    await this._drawText('Character Statistics', FontName.APPLE_II, { x: graphics.getWidth() / 2, y: top }, Colors.WHITE, Alignment.CENTER);
    top += 20;
    const lines = [
      `Kills: ${playerUnit.getLifetimeKills()}`,
      `Damage Dealt: ${playerUnit.getLifetimeDamageDealt()}`,
      `Damage Taken: ${playerUnit.getLifetimeDamageTaken()}`,
      `Mana Spent: ${playerUnit.getLifetimeManaSpent()}`,
      `Steps Taken: ${playerUnit.getLifetimeStepsTaken()}`
    ];
    for (const line of lines) {
      await this._drawText(line, FontName.APPLE_II, { x: 20, y: top }, Colors.WHITE, Alignment.LEFT);
      top += LINE_HEIGHT;
    }
  }

  private _drawText = async (text: string, font: FontName, pixel: Pixel, color: Color, textAlign: Alignment) => {
    const imageBitmap = await this.textRenderer.renderText(text, font, color);
    drawAligned(imageBitmap, this.graphics, pixel, textAlign);
  };
}
