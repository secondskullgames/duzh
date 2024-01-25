import { RenderContext, Renderer } from './Renderer';
import { Graphics } from '../Graphics';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { FontName } from '../Fonts';
import { Pixel } from '../Pixel';
import Color from '../Color';
import { Alignment, drawAligned } from '../RenderingUtils';
import { TextRenderer } from '../TextRenderer';
import Colors from '../Colors';
import { check } from '../../utils/preconditions';

const BACKGROUND_FILENAME = 'inventory_background';

type Props = Readonly<{
  graphics: Graphics;
  textRenderer: TextRenderer;
}>;

export default class LevelUpScreenRenderer implements Renderer {
  private readonly graphics: Graphics;
  private readonly textRenderer: TextRenderer;

  constructor({ graphics, textRenderer }: Props) {
    this.graphics = graphics;
    this.textRenderer = textRenderer;
  }

  render = async ({ state, session }: RenderContext) => {
    const { graphics } = this;
    const playerUnit = state.getPlayerUnit();
    const selectedAbility = session.getLevelUpScreen().getSelectedAbility();

    const image = await session
      .getImageFactory()
      .getImage({ filename: BACKGROUND_FILENAME });
    graphics.drawScaledImage(image, {
      left: 0,
      top: 0,
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT
    });

    const availableAbilities = playerUnit.getLearnableAbilities();
    let top = 10;
    for (const abilityName of availableAbilities) {
      const color: Color =
        abilityName === selectedAbility ? Colors.WHITE : Colors.LIGHT_GRAY;
      await this._drawText(
        abilityName,
        FontName.APPLE_II,
        { x: 20, y: top },
        color,
        Alignment.LEFT
      );
      top += 10;
    }
    top += 10;
    await this._drawText(
      `Ability points remaining: ${playerUnit.getAbilityPoints()}`,
      FontName.APPLE_II,
      { x: 20, y: top },
      Colors.WHITE,
      Alignment.LEFT
    );
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
