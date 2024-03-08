import { Renderer } from './Renderer';
import Colors from '../Colors';
import { LINE_HEIGHT } from '../constants';
import { TextRenderer } from '../TextRenderer';
import PaletteSwaps from '@lib/graphics/PaletteSwaps';
import { Alignment, drawAligned } from '../RenderingUtils';
import { Pixel } from '@lib/geometry/Pixel';
import { Graphics } from '@lib/graphics/Graphics';
import { FontName } from '../Fonts';
import { Session } from '@main/core/Session';
import { type UnitAbility } from '@main/entities/units/abilities/UnitAbility';
import { Feature } from '@main/utils/features';
import Unit from '@main/entities/units/Unit';
import Rect from '@lib/geometry/Rect';
import { GameConfig } from '@main/core/GameConfig';
import ImageFactory from '@lib/graphics/images/ImageFactory';
import { Color } from '@lib/graphics/Color';
import { inject, injectable } from 'inversify';

const HUD_FILENAME = 'brick_hud_3';

const HEIGHT = 64;
const LEFT_PANE_WIDTH = 163;
const RIGHT_PANE_WIDTH = 163;
const BORDER_MARGIN = 5;
const BORDER_PADDING = 5;

const ABILITIES_INNER_MARGIN = 5;
const ABILITY_ICON_WIDTH = 20;

@injectable()
export default class HUDRenderer implements Renderer {
  private readonly TOP: number;
  private readonly MIDDLE_PANE_WIDTH: number;

  constructor(
    @inject(GameConfig)
    gameConfig: GameConfig,
    @inject(Session)
    private readonly session: Session,
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer,
    @inject(ImageFactory)
    private readonly imageFactory: ImageFactory
  ) {
    this.TOP = gameConfig.screenHeight - HEIGHT;
    this.MIDDLE_PANE_WIDTH = gameConfig.screenWidth - LEFT_PANE_WIDTH - RIGHT_PANE_WIDTH;
  }

  /**
   * @override {@link Renderer#render}
   */
  render = async (graphics: Graphics) => {
    await this._renderFrame(graphics);
    await this._renderLeftPanel(graphics);
    await this._renderMiddlePanel(graphics);
    await this._renderRightPanel(graphics);
  };

  private _renderFrame = async (graphics: Graphics) => {
    const image = await this.imageFactory.getImage({
      filename: HUD_FILENAME,
      transparentColor: Colors.WHITE
    });
    graphics.drawImage(image, { x: 0, y: this.TOP });
  };

  /**
   * Renders the bottom-left area of the screen, showing information about the player
   */
  private _renderLeftPanel = async (graphics: Graphics) => {
    const { session } = this;
    const playerUnit = session.getPlayerUnit();

    const lines = [playerUnit.getName(), `Level ${playerUnit.getLevel()}`];

    if (Feature.isEnabled(Feature.HUD_BARS)) {
      lines.push(`      ${playerUnit.getLife()}/${playerUnit.getMaxLife()}`);
    } else {
      lines.push(`Life: ${playerUnit.getLife()}/${playerUnit.getMaxLife()}`);
    }

    if (playerUnit.getMana() !== null && playerUnit.getMaxMana() !== null) {
      if (Feature.isEnabled(Feature.HUD_BARS)) {
        lines.push(`      ${playerUnit.getMana()}/${playerUnit.getMaxMana()}`);
      } else {
        lines.push(`Mana: ${playerUnit.getMana()}/${playerUnit.getMaxMana()}`);
      }
    }

    const left = BORDER_MARGIN + BORDER_PADDING;
    const top = this.TOP + BORDER_MARGIN + BORDER_PADDING;

    for (let i = 0; i < lines.length; i++) {
      const y = top + LINE_HEIGHT * i;
      await this._drawText(
        lines[i],
        FontName.APPLE_II,
        { x: left, y },
        Colors.WHITE,
        Alignment.LEFT,
        graphics
      );
    }

    if (Feature.isEnabled(Feature.HUD_BARS)) {
      await this._renderLifeBar(playerUnit, graphics, {
        left,
        top: top + LINE_HEIGHT * 2 - 2,
        width: 50,
        height: 10
      });
      await this._renderManaBar(playerUnit, graphics, {
        left,
        top: top + LINE_HEIGHT * 3 - 2,
        width: 50,
        height: 10
      });
    }
  };

  private _renderLifeBar = async (unit: Unit, graphics: Graphics, rect: Rect) => {
    const width = Math.round((unit.getLife() / unit.getMaxLife()) * rect.width);
    graphics.fillRect(
      { left: rect.left, top: rect.top, width, height: rect.height },
      Colors.GREEN_255
    );
  };

  private _renderManaBar = async (unit: Unit, graphics: Graphics, rect: Rect) => {
    const width = Math.round((unit.getMana() / unit.getMaxMana()) * rect.width);
    graphics.fillRect(
      { left: rect.left, top: rect.top, width, height: rect.height },
      Colors.CYAN
    );
  };

  private _renderMiddlePanel = async (graphics: Graphics) => {
    const { session } = this;
    const top = this.TOP + BORDER_MARGIN + BORDER_PADDING;
    const playerUnit = session.getPlayerUnit();

    let keyNumber = 1;
    const abilities = playerUnit.getAbilities();
    for (let i = 0; i < abilities.length; i++) {
      const ability = abilities[i];
      const left =
        LEFT_PANE_WIDTH +
        BORDER_PADDING +
        (ABILITIES_INNER_MARGIN + ABILITY_ICON_WIDTH) * (keyNumber - 1);

      if (!ability.innate) {
        await this._renderAbility(ability, { x: left, y: top }, graphics);
        await this._drawText(
          `${keyNumber}`,
          FontName.APPLE_II,
          { x: left + 10, y: top + 24 },
          Colors.WHITE,
          Alignment.CENTER,
          graphics
        );
        await this._drawText(
          `${ability.manaCost}`,
          FontName.APPLE_II,
          { x: left + 10, y: top + 24 + LINE_HEIGHT },
          Colors.LIGHT_GRAY,
          Alignment.CENTER,
          graphics
        );
        keyNumber++;
      }
    }
  };

  private _renderRightPanel = async (graphics: Graphics) => {
    const { session } = this;
    const playerUnit = session.getPlayerUnit();
    const turn = session.getTurn();
    const mapIndex = session.getMapIndex();

    const left =
      LEFT_PANE_WIDTH + this.MIDDLE_PANE_WIDTH + BORDER_MARGIN + BORDER_PADDING;
    const top = this.TOP + BORDER_MARGIN + BORDER_PADDING;

    const lines = [`Turn: ${turn}`, `Floor: ${mapIndex + 1}`];

    const killsToNextLevel = playerUnit.getKillsToNextLevel();
    if (killsToNextLevel !== null) {
      lines.push(`Kills: ${playerUnit.getLifetimeKills()} (${killsToNextLevel})`);
    } else {
      lines.push(`Kills: ${playerUnit.getLifetimeKills()}`);
    }

    for (let i = 0; i < lines.length; i++) {
      const y = top + LINE_HEIGHT * i;
      await this._drawText(
        lines[i],
        FontName.APPLE_II,
        { x: left, y },
        Colors.WHITE,
        Alignment.LEFT,
        graphics
      );
    }
  };

  private _renderAbility = async (
    ability: UnitAbility,
    topLeft: Pixel,
    graphics: Graphics
  ) => {
    const { imageFactory, session } = this;
    const playerUnit = session.getPlayerUnit();
    const queuedAbility = session.getQueuedAbility();

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
    if (ability.icon) {
      const icon = await imageFactory.getImage({
        filename: `abilities/${ability.icon}`,
        paletteSwaps
      });
      graphics.drawImage(icon, topLeft);
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
}
