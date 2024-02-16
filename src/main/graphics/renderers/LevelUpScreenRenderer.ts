import { Renderer } from './Renderer';
import { Graphics } from '../Graphics';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { FontName } from '../Fonts';
import { Pixel } from '../Pixel';
import { Color } from '../Color';
import { Alignment, drawAligned } from '../RenderingUtils';
import { TextRenderer } from '../TextRenderer';
import Colors from '../Colors';
import { Session } from '../../core/Session';
import ImageFactory from '../images/ImageFactory';
import { inject, injectable } from 'inversify';

const BACKGROUND_FILENAME = 'inventory_background';

@injectable()
export default class LevelUpScreenRenderer implements Renderer {
  constructor(
    @inject(Session.SYMBOL)
    private readonly session: Session,
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer,
    @inject(ImageFactory)
    private readonly imageFactory: ImageFactory
  ) {}

  render = async (graphics: Graphics) => {
    const { session, imageFactory } = this;
    const playerUnit = session.getPlayerUnit();
    const selectedAbility = session.getLevelUpScreen().getSelectedAbility();

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
      const color: Color =
        abilityName === selectedAbility ? Colors.WHITE : Colors.LIGHT_GRAY;
      await this._drawText(
        abilityName,
        FontName.APPLE_II,
        { x: 20, y: top },
        color,
        Alignment.LEFT,
        graphics
      );
      top += 10;
    }
    top += 10;
    await this._drawText(
      `Ability points remaining: ${playerUnit.getAbilityPoints()}`,
      FontName.APPLE_II,
      { x: 20, y: top },
      Colors.WHITE,
      Alignment.LEFT,
      graphics
    );
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
