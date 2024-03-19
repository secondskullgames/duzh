import { Renderer } from './Renderer';
import { FontName } from '../Fonts';
import { Alignment, drawAligned } from '../RenderingUtils';
import { TextRenderer } from '../TextRenderer';
import Colors from '../Colors';
import Unit from '@main/units/Unit';
import { Pixel } from '@lib/geometry/Pixel';
import { Graphics } from '@lib/graphics/Graphics';
import { Session } from '@main/core/Session';
import { GameConfig } from '@main/core/GameConfig';
import ImageFactory from '@lib/graphics/images/ImageFactory';
import { Color } from '@lib/graphics/Color';
import { AbilityName } from '@main/abilities/AbilityName';
import { inject, injectable } from 'inversify';

const BACKGROUND_FILENAME = 'inventory_background';

@injectable()
export default class LevelUpScreenRenderer implements Renderer {
  constructor(
    @inject(GameConfig)
    private readonly gameConfig: GameConfig,
    @inject(Session)
    private readonly session: Session,
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer,
    @inject(ImageFactory)
    private readonly imageFactory: ImageFactory
  ) {}

  render = async (graphics: Graphics) => {
    const { session, imageFactory } = this;
    const playerUnit = session.getPlayerUnit();

    const image = await imageFactory.getImage({ filename: BACKGROUND_FILENAME });
    graphics.drawScaledImage(image, {
      left: 0,
      top: 0,
      width: this.gameConfig.screenWidth,
      height: this.gameConfig.screenHeight
    });

    const listedAbilities = playerUnit
      .getPlayerUnitClass()!
      .getAllPossibleLearnableAbilities();
    let top = 10;
    for (const abilityName of listedAbilities) {
      const color: Color = this._getAbilityColor(playerUnit, abilityName);
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

  private _getAbilityColor = (playerUnit: Unit, abilityName: AbilityName) => {
    const isUnlocked = this._isUnlocked(abilityName, playerUnit);
    const selectedAbility = this.session.getLevelUpScreen().getSelectedAbility();
    const isSelected = abilityName === selectedAbility;

    if (playerUnit.hasAbility(abilityName)) {
      return Colors.DARK_GRAY;
    } else if (isUnlocked) {
      return isSelected ? Colors.WHITE : Colors.LIGHT_GRAY;
    } else {
      return isSelected ? Colors.RED : Colors.DARK_RED;
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

  private _isUnlocked = (abilityName: AbilityName, playerUnit: Unit): boolean => {
    return playerUnit.getCurrentlyLearnableAbilities().includes(abilityName);
  };
}
