import GameState from '../../core/GameState';
import Coordinates from '../../geometry/Coordinates';
import UnitAbility from '../../units/UnitAbility';
import Color from '../Color';
import Colors from '../Colors';
import { LINE_HEIGHT, SCREEN_WIDTH } from '../constants';
import { FontDefinition, Fonts, renderFont } from '../FontRenderer';
import ImageFactory from '../images/ImageFactory';
import PaletteSwaps from '../PaletteSwaps';
import { Alignment, drawAligned } from '../RenderingUtils';
import Renderer from './Renderer';

const HUD_FILENAME = 'brick_hud_3';

const HEIGHT = 64;
const LEFT_PANE_WIDTH = 163;
const RIGHT_PANE_WIDTH = 163;
const MIDDLE_PANE_WIDTH = SCREEN_WIDTH - LEFT_PANE_WIDTH - RIGHT_PANE_WIDTH;
const BORDER_MARGIN = 5;
const BORDER_PADDING = 5;

const ABILITIES_INNER_MARGIN = 5;
const ABILITY_ICON_WIDTH = 20;

class HUDRenderer extends Renderer {
  constructor() {
    super({ width: SCREEN_WIDTH, height: HEIGHT, id: 'hud' });
  }

  _redraw = async () => {
    await this._renderFrame();
    await Promise.all([
      this._renderLeftPanel(),
      this._renderMiddlePanel(),
      this._renderRightPanel(),
    ]);
  };

  _renderFrame = async () => {
    const image = await ImageFactory.getImage({
      filename: HUD_FILENAME,
      transparentColor: Colors.WHITE
    });
    this.context.drawImage(image.bitmap, 0, 0, image.bitmap.width, image.bitmap.height);
  };

  /**
   * Renders the bottom-left area of the screen, showing information about the player
   */
  _renderLeftPanel = async () => {
    const playerUnit = GameState.getInstance().getPlayerUnit();

    const lines = [
      playerUnit.name,
      `Level ${playerUnit.level}`,
      `Life: ${playerUnit.life}/${playerUnit.maxLife}`
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
    let left = LEFT_PANE_WIDTH + BORDER_PADDING; // border width is considered part of the left panel
    const top = BORDER_MARGIN + BORDER_PADDING;
    const playerUnit = GameState.getInstance().getPlayerUnit();

    let keyNumber = 1;
    for (let i = 0; i < playerUnit.getAbilities().length; i++) {
      const ability = playerUnit.getAbilities()[i];
      if (!!ability.icon) {
        await this._renderAbility(ability, left, top);
        await this._drawText(`${keyNumber}`, Fonts.APPLE_II, { x: left + 10, y: top + 24 }, Colors.WHITE, 'center');
        await this._drawText(`${ability.manaCost}`, Fonts.APPLE_II, { x: left + 10, y: top + 24 + LINE_HEIGHT }, Colors.LIGHT_GRAY, 'center');
        left += ABILITIES_INNER_MARGIN + ABILITY_ICON_WIDTH;
        keyNumber++;
      }
    }
  };

  _renderRightPanel = async () => {
    const state = GameState.getInstance();
    const playerUnit = state.getPlayerUnit();
    const turn = state.getTurn();
    const mapIndex = state.getMapIndex();

    const left = LEFT_PANE_WIDTH + MIDDLE_PANE_WIDTH + BORDER_MARGIN + BORDER_PADDING;
    const top = this.height - HEIGHT + BORDER_MARGIN + BORDER_PADDING;

    const lines = [
      `Turn: ${turn}`,
      `Floor: ${(mapIndex || 0) + 1}`,
    ];

    const experienceToNextLevel = playerUnit.experienceToNextLevel();
    if (experienceToNextLevel !== null) {
      lines.push(`Experience: ${playerUnit.experience}/${experienceToNextLevel}`);
    }

    for (let i = 0; i < lines.length; i++) {
      const y = top + (LINE_HEIGHT * i);
      await this._drawText(lines[i], Fonts.APPLE_II, { x: left, y }, Colors.WHITE, 'left');
    }
  };

  _renderAbility = async (ability: UnitAbility, left: number, top: number) => {
    const state = GameState.getInstance();
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
    await this.context.drawImage(image.bitmap, left, top);
  };

  private _drawText = async (text: string, font: FontDefinition, { x, y }: Coordinates, color: Color, textAlign: Alignment) => {
    const imageBitmap = await renderFont(text, font, color);
    await drawAligned(imageBitmap, this.context, { x, y }, textAlign);
  };
}

export default HUDRenderer;
