import GameState from '../../core/GameState';
import Coordinates from '../../geometry/Coordinates';
import UnitAbility from '../../units/abilities/UnitAbility';
import Color from '../Color';
import Colors from '../Colors';
import { LINE_HEIGHT, SCREEN_WIDTH } from '../constants';
import { FontDefinition, Fonts, renderFont } from '../FontRenderer';
import ImageFactory from '../images/ImageFactory';
import PaletteSwaps from '../PaletteSwaps';
import { Alignment, drawAligned } from '../RenderingUtils';
import AbstractRenderer from './AbstractRenderer';

const HUD_FILENAME = 'brick_hud_3';

const HEIGHT = 64;
const LEFT_PANE_WIDTH = 163;
const RIGHT_PANE_WIDTH = 163;
const MIDDLE_PANE_WIDTH = SCREEN_WIDTH - LEFT_PANE_WIDTH - RIGHT_PANE_WIDTH;
const BORDER_MARGIN = 5;
const BORDER_PADDING = 5;

const ABILITIES_INNER_MARGIN = 5;
const ABILITY_ICON_WIDTH = 20;

type Props = Readonly<{
  state: GameState
}>;

class HUDRenderer extends AbstractRenderer {
  private readonly state: GameState;

  constructor({ state }: Props) {
    super({ width: SCREEN_WIDTH, height: HEIGHT, id: 'hud' });
    this.state = state;
  }

  _redraw = async () => {
    await this._renderFrame();
    await this._renderLeftPanel();
    await this._renderMiddlePanel();
    await this._renderRightPanel();
  };

  _renderFrame = async () => {
    const image = await ImageFactory.getImage({
      filename: HUD_FILENAME,
      transparentColor: Colors.WHITE
    });
    this.context.drawImage(image.bitmap, 0, 0, image.width, image.height);
  };

  /**
   * Renders the bottom-left area of the screen, showing information about the player
   */
  _renderLeftPanel = async () => {
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
    const top = BORDER_MARGIN + BORDER_PADDING;

    for (let i = 0; i < lines.length; i++) {
      const y = top + (LINE_HEIGHT * i);
      await this._drawText(lines[i], Fonts.APPLE_II, { x: left, y }, Colors.WHITE, 'left');
    }
  };

  _renderMiddlePanel = async () => {
    const top = BORDER_MARGIN + BORDER_PADDING;
    const playerUnit = this.state.getPlayerUnit();

    let keyNumber = 1;
    const abilities = playerUnit.getAbilities();
    for (let i = 0; i < abilities.length; i++) {
      const ability = abilities[i];
      const left = LEFT_PANE_WIDTH + BORDER_PADDING + (ABILITIES_INNER_MARGIN + ABILITY_ICON_WIDTH) * i;
      if (ability.icon) {
        await this._renderAbility(ability, left, top);
        await this._drawText(`${keyNumber}`, Fonts.APPLE_II, { x: left + 10, y: top + 24 }, Colors.WHITE, 'center');
        await this._drawText(`${ability.manaCost}`, Fonts.APPLE_II, { x: left + 10, y: top + 24 + LINE_HEIGHT }, Colors.LIGHT_GRAY, 'center');
        keyNumber++;
      }
    }
  };

  _renderRightPanel = async () => {
    const { state } = this;
    const playerUnit = state.getPlayerUnit();
    const turn = state.getTurn();
    const mapIndex = state.getMapIndex();

    const left = LEFT_PANE_WIDTH + MIDDLE_PANE_WIDTH + BORDER_MARGIN + BORDER_PADDING;
    const top = this.height - HEIGHT + BORDER_MARGIN + BORDER_PADDING;

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

  _renderAbility = async (ability: UnitAbility, left: number, top: number) => {
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
    const image = await ImageFactory.getImage({
      filename: `abilities/${ability.icon}`,
      paletteSwaps
    });
    this.context.drawImage(image.bitmap, left, top);
  };

  private _drawText = async (text: string, font: FontDefinition, { x, y }: Coordinates, color: Color, textAlign: Alignment) => {
    const imageBitmap = await renderFont(text, font, color);
    drawAligned(imageBitmap, this.context, { x, y }, textAlign);
  };
}

export default HUDRenderer;
