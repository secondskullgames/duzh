import { Renderer } from './Renderer';
import { Graphics } from '../Graphics';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { AbilityName } from '../../entities/units/abilities/AbilityName';
import ImageFactory from '../images/ImageFactory';
import GameState from '../../core/GameState';
import { FontName } from '../Fonts';
import { Pixel } from '../Pixel';
import Color from '../Color';
import { Alignment, drawAligned } from '../RenderingUtils';
import { TextRenderer } from '../TextRenderer';
import Colors from '../Colors';

const BACKGROUND_FILENAME = 'inventory_background';
const LEARNABLE_ABILITIES = [
  AbilityName.HEAVY_ATTACK,
  AbilityName.KNOCKBACK_ATTACK,
  AbilityName.STUN_ATTACK,
  AbilityName.DASH
];

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

  private chosenAbility: AbilityName | null;

  constructor({ graphics, imageFactory, state, textRenderer }: Props) {
    this.graphics = graphics;
    this.imageFactory = imageFactory;
    this.state = state;
    this.textRenderer = textRenderer;
    this.chosenAbility = null;
  }

  render = async () => {
    const { graphics, imageFactory } = this;
    const image = await imageFactory.getImage({ filename: BACKGROUND_FILENAME });
    graphics.drawScaledImage(image, {
      left: 0,
      top: 0,
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT
    });

    await this._renderAbilities();
  }

  private _renderAbilities = async () => {
    const playerUnit = this.state.getPlayerUnit();

    const availableAbilities = LEARNABLE_ABILITIES.filter(ability => !playerUnit.hasAbility(ability));
    let top = 10;
    for (const abilityName of availableAbilities) {
      await this._drawText(abilityName, FontName.APPLE_II, { x: 20, y: top }, Colors.WHITE, Alignment.LEFT);
      top += 10;
    }
  };

  private _drawText = async (text: string, font: FontName, pixel: Pixel, color: Color, textAlign: Alignment) => {
    const image = await this.textRenderer.renderText(text, font, color);
    drawAligned(image, this.graphics, pixel, textAlign);
  };
}