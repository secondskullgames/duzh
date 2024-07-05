import { Renderer } from './Renderer';
import Colors from '../Colors';
import { LINE_HEIGHT } from '../constants';
import { TextRenderer } from '../TextRenderer';
import { Alignment, drawAligned } from '../RenderingUtils';
import { FontName } from '../Fonts';
import { PaletteSwaps } from '@lib/graphics/PaletteSwaps';
import { Pixel } from '@lib/geometry/Pixel';
import { Graphics } from '@lib/graphics/Graphics';
import { Session } from '@main/core/Session';
import { Feature } from '@main/utils/features';
import Unit from '@main/units/Unit';
import { Rect } from '@lib/geometry/Rect';
import { GameConfig } from '@main/core/GameConfig';
import ImageFactory from '@lib/graphics/images/ImageFactory';
import { Color } from '@lib/graphics/Color';
import { checkNotNull } from '@lib/utils/preconditions';
import { AbilityName } from '@main/abilities/AbilityName';
import { type UnitAbility } from '@main/abilities/UnitAbility';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import { formatTimestamp } from '@lib/utils/time';
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
  private readonly WIDTH: number;
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
    this.WIDTH = gameConfig.screenWidth;
    this.MIDDLE_PANE_WIDTH = gameConfig.screenWidth - LEFT_PANE_WIDTH - RIGHT_PANE_WIDTH;
  }

  /**
   * @override {@link Renderer#render}
   */
  render = async (graphics: Graphics) => {
    await this._renderFrame(graphics);
    this._renderLeftPanel(graphics);
    await this._renderMiddlePanel(graphics);
    this._renderRightPanel(graphics);
  };

  private _renderFrame = async (graphics: Graphics) => {
    const fillColor = (() => {
      const playerUnit = this.session.getPlayerUnit();
      if (playerUnit.getEffects().hasEffect(StatusEffect.STUNNED)) {
        return Colors.GRAY_128;
      } else {
        return Colors.BLACK;
      }
    })();
    graphics.fillRect(
      { left: 0, top: this.TOP, width: this.WIDTH, height: HEIGHT },
      fillColor
    );
    const image = await this.imageFactory.getImage({
      filename: HUD_FILENAME,
      transparentColor: Colors.BLACK
    });
    graphics.drawImage(image, { x: 0, y: this.TOP });
  };

  /**
   * Renders the bottom-left area of the screen, showing information about the player
   */
  private _renderLeftPanel = (graphics: Graphics) => {
    const { session } = this;
    const playerUnit = session.getPlayerUnit();

    const lines = [];
    if (playerUnit.getEffects().hasEffect(StatusEffect.STUNNED)) {
      lines.push('STUNNED');
    } else {
      lines.push(playerUnit.getName());
    }
    lines.push(`Level ${playerUnit.getLevel()}`);

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
      this._drawText(
        lines[i],
        FontName.APPLE_II,
        { x: left, y },
        Colors.WHITE,
        Alignment.LEFT,
        graphics
      );
    }

    if (Feature.isEnabled(Feature.HUD_BARS)) {
      this._renderLifeBar(playerUnit, graphics, {
        left,
        top: top + LINE_HEIGHT * 2 - 2,
        width: 50,
        height: 10
      });
      this._renderManaBar(playerUnit, graphics, {
        left,
        top: top + LINE_HEIGHT * 3 - 2,
        width: 50,
        height: 10
      });
    }
  };

  private _renderLifeBar = (unit: Unit, graphics: Graphics, rect: Rect) => {
    const width = Math.round((unit.getLife() / unit.getMaxLife()) * rect.width);
    graphics.fillRect(
      { left: rect.left, top: rect.top, width, height: rect.height },
      Colors.GREEN_255
    );
  };

  private _renderManaBar = (unit: Unit, graphics: Graphics, rect: Rect) => {
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
    const playerUnitClass = checkNotNull(playerUnit.getPlayerUnitClass());
    const isNumberedAbility = (ability: UnitAbility) =>
      ability.name !== AbilityName.ATTACK &&
      ability.name !== AbilityName.DASH &&
      ability.name !== AbilityName.SHOOT_ARROW &&
      ability.name !== AbilityName.SHOOT_FIREBOLT &&
      ability.name !== AbilityName.SHOOT_FROSTBOLT;
    const numberedAbilities = playerUnit.getAbilities().filter(isNumberedAbility);
    for (let i = 0; i < numberedAbilities.length; i++) {
      const ability = numberedAbilities[i];
      const hotkey = playerUnitClass.getHotkeyForAbility(ability, playerUnit);
      const left =
        LEFT_PANE_WIDTH +
        BORDER_PADDING +
        (ABILITIES_INNER_MARGIN + ABILITY_ICON_WIDTH) * i;

      if (ability.icon) {
        await this._renderAbility(ability, { x: left, y: top }, graphics);
        this._drawText(
          `${hotkey}`,
          FontName.APPLE_II,
          { x: left + 10, y: top + 24 },
          Colors.WHITE,
          Alignment.CENTER,
          graphics
        );
        this._drawText(
          `${ability.manaCost}`,
          FontName.APPLE_II,
          { x: left + 10, y: top + 24 + LINE_HEIGHT },
          Colors.LIGHT_GRAY,
          Alignment.CENTER,
          graphics
        );
      }
    }
    const nonNumberedAbilities = playerUnitClass.getRightAlignedAbilities(playerUnit);
    // TODO massive code duplication
    for (let i = 0; i < nonNumberedAbilities.length; i++) {
      const ability = nonNumberedAbilities[i];
      const hotkey = playerUnitClass.getHotkeyForAbility(ability, playerUnit);
      const left =
        LEFT_PANE_WIDTH +
        BORDER_PADDING +
        this.MIDDLE_PANE_WIDTH +
        ABILITIES_INNER_MARGIN * (-4 + i) +
        ABILITY_ICON_WIDTH * (-3 + i);

      await this._renderAbility(ability, { x: left, y: top }, graphics);
      this._drawText(
        `${hotkey}`,
        FontName.APPLE_II,
        { x: left + 10, y: top + 24 },
        Colors.WHITE,
        Alignment.CENTER,
        graphics
      );
      this._drawText(
        `${ability.manaCost}`,
        FontName.APPLE_II,
        { x: left + 10, y: top + 24 + LINE_HEIGHT },
        Colors.LIGHT_GRAY,
        Alignment.CENTER,
        graphics
      );
    }
  };

  private _renderRightPanel = (graphics: Graphics) => {
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
    lines.push(`Time: ${formatTimestamp(session.getElapsedTime())}`);

    for (let i = 0; i < lines.length; i++) {
      const y = top + LINE_HEIGHT * i;
      this._drawText(
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
    } else if (ability.isEnabled(playerUnit)) {
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

  private _drawText = (
    text: string,
    fontName: FontName,
    pixel: Pixel,
    color: Color,
    textAlign: Alignment,
    graphics: Graphics
  ) => {
    const imageData = this.textRenderer.renderText({
      text,
      fontName,
      color,
      backgroundColor: Colors.BLACK
    });
    drawAligned(imageData, graphics, pixel, textAlign);
  };
}
