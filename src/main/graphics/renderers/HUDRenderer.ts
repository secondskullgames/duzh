import GameState from '../../core/GameState';
import Color from '../../types/Color';
import { Coordinates } from '../../types/types';
import UnitAbility from '../../units/UnitAbility';
import BufferedRenderer from './BufferedRenderer';
import { LINE_HEIGHT, SCREEN_WIDTH, TILE_HEIGHT, TILE_WIDTH } from '../constants';
import { FontDefinition, Fonts, renderFont } from '../FontRenderer';
import ImageLoader from '../images/ImageLoader';
import { applyTransparentColor, replaceColors } from '../images/ImageUtils';
import { Alignment, drawAligned } from '../RenderingUtils';

const HUD_FILENAME = 'HUD2';

const HEIGHT = 3 * TILE_HEIGHT;
const LEFT_PANE_WIDTH = 5 * TILE_WIDTH;
const RIGHT_PAIN_WIDTH = 5 * TILE_WIDTH;
const MARGIN_THICKNESS = 5;
const BORDER_MARGIN = 3;

const ABILITIES_PANEL_HEIGHT = 48;
const ABILITIES_OUTER_MARGIN = 13;
const ABILITIES_INNER_MARGIN = 10;
const ABILITY_ICON_WIDTH = 20;
const ABILITIES_Y_MARGIN = 4;

class HUDRenderer extends BufferedRenderer {
  constructor() {
    super({ width: SCREEN_WIDTH, height: HEIGHT, id: 'hud' });
  }

  renderBuffer = async () => {
    await this._renderFrame();
    await Promise.all([
      this._renderLeftPanel(),
      this._renderMiddlePanel(),
      this._renderRightPanel(),
    ]);
  };

  _renderFrame = async () => {
    const imageData = await ImageLoader.loadImage(HUD_FILENAME)
      .then(imageData => applyTransparentColor(imageData, Color.WHITE));
    const imageBitmap = await createImageBitmap(imageData);
    this.bufferContext.drawImage(imageBitmap, 0, 0, imageBitmap.width, imageBitmap.height);
  };

  /**
   * Renders the bottom-left area of the screen, showing information about the player
   */
  _renderLeftPanel = async () => {
    const { playerUnit } = GameState.getInstance();

    const lines = [
      playerUnit.name,
      `Level ${playerUnit.level}`,
      `Life: ${playerUnit.life}/${playerUnit.maxLife}`,
      `Damage: ${playerUnit.getDamage()}`,
    ];

    const left = MARGIN_THICKNESS;
    const top = MARGIN_THICKNESS;
    for (let i = 0; i < lines.length; i++) {
      const y = top + (LINE_HEIGHT * i);
      await this._drawText(lines[i], Fonts.PERFECT_DOS_VGA, { x: left, y }, Color.WHITE, 'left');
    }
  };

  _renderMiddlePanel = async () => {
    let left = LEFT_PANE_WIDTH + ABILITIES_OUTER_MARGIN;
    const top = this.height - ABILITIES_PANEL_HEIGHT + BORDER_MARGIN + ABILITIES_Y_MARGIN;
    const { playerUnit } = GameState.getInstance();

    let keyNumber = 1;
    for (let i = 0; i < playerUnit.abilities.length; i++) {
      const ability = playerUnit.abilities[i];
      if (!!ability.icon) {
        await this._renderAbility(ability, left, top);
        await this._drawText(`${keyNumber}`, Fonts.PERFECT_DOS_VGA, { x: left + 10, y: top + 24 }, Color.WHITE, 'center');
        left += ABILITIES_INNER_MARGIN + ABILITY_ICON_WIDTH;
        keyNumber++;
      }
    }
  };

  _renderRightPanel = async () => {
    const { mapIndex, playerUnit, turn } = GameState.getInstance();

    const left = this.width - RIGHT_PAIN_WIDTH + MARGIN_THICKNESS;
    const top = this.height - HEIGHT + MARGIN_THICKNESS;

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
      await this._drawText(lines[i], Fonts.PERFECT_DOS_VGA, { x: left, y }, Color.WHITE, 'left');
    }
  };

  _renderAbility = async (ability: UnitAbility, left: number, top: number) => {
    let borderColor: Color;
    const { queuedAbility, playerUnit } = GameState.getInstance();
    if (queuedAbility === ability) {
      borderColor = Color.GREEN;
    } else if (playerUnit.getCooldown(ability) === 0) {
      borderColor = Color.WHITE;
    } else {
      borderColor = Color.DARK_GRAY;
    }

    const imageData = await ImageLoader.loadImage(`abilities/${ability.icon}`)
      .then(image => replaceColors(image, { [Color.DARK_GRAY]: borderColor }));

    const imageBitmap = await createImageBitmap(imageData);
    await this.bufferContext.drawImage(imageBitmap, left, top);
  };

  private _drawText = async (text: string, font: FontDefinition, { x, y }: Coordinates, color: Color, textAlign: Alignment) => {
    const imageBitmap = await renderFont(text, font, color);
    await drawAligned(imageBitmap, this.bufferContext, { x, y }, textAlign);
  };
}

export default HUDRenderer;