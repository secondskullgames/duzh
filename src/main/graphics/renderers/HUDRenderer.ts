import GameState from '../../core/GameState';
import Coordinates from '../../geometry/Coordinates';
import { type UnitAbility } from '../../entities/units/abilities/UnitAbility';
import Color from '../Color';
import Colors from '../Colors';
import { LINE_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { FontDefinition, FontRenderer } from '../FontRenderer';
import ImageFactory from '../images/ImageFactory';
import PaletteSwaps from '../PaletteSwaps';
import { Alignment, drawAligned } from '../RenderingUtils';
import Fonts from '../Fonts';
import { Renderer } from './Renderer';
import { Pixel } from '../Pixel';

const HUD_FILENAME = 'brick_hud_3';

const HEIGHT = 64;
const TOP = SCREEN_HEIGHT - HEIGHT;
const LEFT_PANE_WIDTH = 163;
const RIGHT_PANE_WIDTH = 163;
const MIDDLE_PANE_WIDTH = SCREEN_WIDTH - LEFT_PANE_WIDTH - RIGHT_PANE_WIDTH;
const BORDER_MARGIN = 5;
const BORDER_PADDING = 5;

const ABILITIES_INNER_MARGIN = 5;
const ABILITY_ICON_WIDTH = 20;

type Props = Readonly<{
  state: GameState,
  fontRenderer: FontRenderer,
  imageFactory: ImageFactory,
  context: CanvasRenderingContext2D
}>;

class HUDRenderer implements Renderer {
  private readonly state: GameState;
  private readonly fontRenderer: FontRenderer;
  private readonly imageFactory: ImageFactory;
  private readonly context: CanvasRenderingContext2D;

  constructor({ state, fontRenderer, imageFactory, context }: Props) {
    this.state = state;
    this.fontRenderer = fontRenderer;
    this.imageFactory = imageFactory;
    this.context = context;
  }

  /**
   * @override {@link Renderer#render}
   */
  render = async () => {
    await this._renderFrame();
    await this._renderLeftPanel();
    await this._renderMiddlePanel();
    await this._renderRightPanel();
  };

  private _renderFrame = async () => {
    const image = await this.imageFactory.getImage({
      filename: HUD_FILENAME,
      transparentColor: Colors.WHITE
    });
    this.context.drawImage(image.bitmap, 0, TOP, image.width, image.height);
  };

  /**
   * Renders the bottom-left area of the screen, showing information about the player
   */
  private _renderLeftPanel = async () => {
    const playerUnit = this.state.getPlayerUnit();

    const lines = [
      playerUnit.getName(),
      `Level ${playerUnit.getLevel()}`,
      `Life: ${playerUnit.getLife()}/${playerUnit.getMaxLife()}`
    ];

    if (playerUnit.getMana() !== null && playerUnit.getMaxMana() !== null) {
      lines.push(`Mana: ${playerUnit.getMana()}/${playerUnit.getMaxMana()}`);
    }

    const left = BORDER_MARGIN + BORDER_PADDING;
    const top = TOP + BORDER_MARGIN + BORDER_PADDING;

    for (let i = 0; i < lines.length; i++) {
      const y = top + (LINE_HEIGHT * i);
      await this._drawText(lines[i], Fonts.APPLE_II, { x: left, y }, Colors.WHITE, 'left');
    }
  };

  private _renderMiddlePanel = async () => {
    const top = TOP + BORDER_MARGIN + BORDER_PADDING;
    const playerUnit = this.state.getPlayerUnit();

    let keyNumber = 1;
    const abilities = playerUnit.getAbilities();
    for (let i = 0; i < abilities.length; i++) {
      const ability = abilities[i];
      const left = LEFT_PANE_WIDTH + BORDER_PADDING + (ABILITIES_INNER_MARGIN + ABILITY_ICON_WIDTH) * i;
      if (ability.icon) {
        await this._renderAbility(ability, { x: left, y: top });
        await this._drawText(`${keyNumber}`, Fonts.APPLE_II, { x: left + 10, y: top + 24 }, Colors.WHITE, 'center');
        await this._drawText(`${ability.manaCost}`, Fonts.APPLE_II, { x: left + 10, y: top + 24 + LINE_HEIGHT }, Colors.LIGHT_GRAY, 'center');
        keyNumber++;
      }
    }
  };

  private _renderRightPanel = async () => {
    const { state } = this;
    const playerUnit = state.getPlayerUnit();
    const turn = state.getTurn();
    const mapIndex = state.getMapIndex();

    const left = LEFT_PANE_WIDTH + MIDDLE_PANE_WIDTH + BORDER_MARGIN + BORDER_PADDING;
    const top = TOP + BORDER_MARGIN + BORDER_PADDING;

    const lines = [
      `Turn: ${turn}`,
      `Floor: ${mapIndex + 1}`,
    ];

    const experienceToNextLevel = playerUnit.experienceToNextLevel();
    if (experienceToNextLevel !== null) {
      lines.push(`Experience: ${playerUnit.getExperience()}/${experienceToNextLevel}`);
    }

    for (let i = 0; i < lines.length; i++) {
      const y = top + (LINE_HEIGHT * i);
      await this._drawText(lines[i], Fonts.APPLE_II, { x: left, y }, Colors.WHITE, 'left');
    }
  };

  _renderAbility = async (ability: UnitAbility, topLeft: Pixel) => {
    const { state } = this;
    const playerUnit = state.getPlayerUnit();
    const queuedAbility = state.getQueuedAbility();

    let borderColor: Color;

    if (queuedAbility === ability) {
      borderColor = Colors.GREEN;
    } else if (playerUnit.canSpendMana(ability.manaCost)) {
      borderColor = Colors.WHITE;
    } else {
      borderColor = Colors.DARK_GRAY;
    }

    const paletteSwaps = PaletteSwaps.builder()
      .addMapping(Colors.DARK_GRAY, borderColor)
      .build();
    const image = await this.imageFactory.getImage({
      filename: `abilities/${ability.icon}`,
      paletteSwaps
    });
    this.context.drawImage(image.bitmap, topLeft.x, topLeft.y);
  };

  private _drawText = async (text: string, font: FontDefinition, pixel: Pixel, color: Color, textAlign: Alignment) => {
    const imageBitmap = await this.fontRenderer.renderFont(text, font, color);
    drawAligned(imageBitmap, this.context, pixel, textAlign);
  };
}

export default HUDRenderer;
