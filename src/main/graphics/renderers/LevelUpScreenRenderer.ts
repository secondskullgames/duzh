import { Renderer } from './Renderer';
import { Graphics } from '../Graphics';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import ImageFactory from '../images/ImageFactory';
import GameState from '../../core/GameState';
import { FontName } from '../Fonts';
import { Pixel } from '../Pixel';
import Color from '../Color';
import { Alignment, drawAligned } from '../RenderingUtils';
import { TextRenderer } from '../TextRenderer';
import Colors from '../Colors';

const BACKGROUND_FILENAME = 'inventory_background';

type Props = Readonly<{
  graphics: Graphics,
  imageFactory: ImageFactory,
  state: GameState,
  textRenderer: TextRenderer
}>;

export default class LevelUpScreenRenderer implements Renderer {
  private readonly graphics: Graphics;
  private readonly imageFactory: ImageFactory;
  private readonly state: GameState;
  private readonly textRenderer: TextRenderer;

  constructor({ graphics, imageFactory, state, textRenderer }: Props) {
    this.graphics = graphics;
    this.imageFactory = imageFactory;
    this.state = state;
    this.textRenderer = textRenderer;
  }

  render = async () => {
    const { graphics, imageFactory, state } = this;
    const playerUnit = state.getPlayerUnit();
    const selectedAbility = state.getSelectedLevelUpScreenAbility();

    const image = await imageFactory.getImage({ filename: BACKGROUND_FILENAME });
    graphics.drawScaledImage(image, {
      left: 0,
      top: 0,
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT
    });

    const availableAbilities = playerUnit.getLearnableAbilities();
    let top = 10;
    for (const abilityName of availableAbilities) {
      const color: Color = (abilityName === selectedAbility)
        ? Colors.WHITE
        : Colors.LIGHT_GRAY;
      await this._drawText(abilityName, FontName.APPLE_II, { x: 20, y: top }, color, Alignment.LEFT);
      top += 10;
    }
    top += 10;
    await this._drawText(`Ability points remaining: ${playerUnit.getAbilityPoints()}`, FontName.APPLE_II, { x: 20, y: top }, Colors.WHITE, Alignment.LEFT);
  };

  private _drawText = async (text: string, font: FontName, pixel: Pixel, color: Color, textAlign: Alignment) => {
    const image = await this.textRenderer.renderText(text, font, color);
    drawAligned(image, this.graphics, pixel, textAlign);
  };
}