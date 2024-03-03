import { Renderer } from './Renderer';
import { Color } from '../Color';
import Colors from '../Colors';
import { LINE_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { TextRenderer } from '../TextRenderer';
import PaletteSwaps from '../PaletteSwaps';
import { Alignment, drawAligned } from '../RenderingUtils';
import { Pixel } from '../Pixel';
import { Graphics } from '../Graphics';
import { FontName } from '../Fonts';
import ImageFactory from '../images/ImageFactory';
import { Session } from '@main/core/Session';
import { type UnitAbility } from '@main/entities/units/abilities/UnitAbility';
import { Feature } from '@main/utils/features';
import Unit from '@main/entities/units/Unit';
import Rect from '@main/geometry/Rect';
import { inject, injectable } from 'inversify';

const WIDTH = 160;
const HEIGHT = SCREEN_HEIGHT;
const PANEL_HEIGHT = 90;
const BORDER_PADDING = 5;
const LEFT = SCREEN_WIDTH - WIDTH;
const TOP = 0;

const ABILITIES_INNER_MARGIN = 5;
const ABILITY_ICON_WIDTH = 20;

@injectable()
export default class HUDRenderer2 implements Renderer {
  constructor(
    @inject(Session.SYMBOL)
    private readonly session: Session,
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer,
    @inject(ImageFactory)
    private readonly imageFactory: ImageFactory
  ) {}

  /**
   * @override {@link Renderer#render}
   */
  render = async (graphics: Graphics) => {
    await this._renderFrame(graphics);
    await this._renderPlayerStats(graphics);
    await this._renderAbilities(graphics);
    await this._renderCountersPanel(graphics);
  };

  private _renderFrame = async (graphics: Graphics) => {
    graphics.fillRect(
      { left: LEFT, top: 0, width: WIDTH, height: HEIGHT },
      Colors.BLUE_128
    );
  };

  /**
   * Renders the player stats panel
   */
  private _renderPlayerStats = async (graphics: Graphics) => {
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

    const left = LEFT + BORDER_PADDING;
    const top = TOP + PANEL_HEIGHT + BORDER_PADDING;

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

  private _renderAbilities = async (graphics: Graphics) => {
    const { session } = this;
    const top = TOP + 2 * PANEL_HEIGHT + BORDER_PADDING;
    const playerUnit = session.getPlayerUnit();

    let keyNumber = 1;
    const abilities = playerUnit.getAbilities();
    for (let i = 0; i < abilities.length; i++) {
      const ability = abilities[i];
      const left =
        LEFT +
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

  /**
   * experience, turn number, ...
   */
  private _renderCountersPanel = async (graphics: Graphics) => {
    const { session } = this;
    const playerUnit = session.getPlayerUnit();
    const turn = session.getTurn();
    const mapIndex = session.getMapIndex();

    const left = LEFT + BORDER_PADDING;
    const top = TOP + 3 * PANEL_HEIGHT + BORDER_PADDING;

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
