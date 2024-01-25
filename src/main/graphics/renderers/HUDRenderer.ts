import { RenderContext, Renderer } from './Renderer';
import { type UnitAbility } from '../../entities/units/abilities/UnitAbility';
import Color from '../Color';
import Colors from '../Colors';
import { LINE_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { TextRenderer } from '../TextRenderer';
import PaletteSwaps from '../PaletteSwaps';
import { Alignment, drawAligned } from '../RenderingUtils';
import { Pixel } from '../Pixel';
import { Graphics } from '../Graphics';
import { FontName } from '../Fonts';
import { AbilityName } from '../../entities/units/abilities/AbilityName';
import getInnateAbilities = AbilityName.getInnateAbilities;

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
  textRenderer: TextRenderer;
  graphics: Graphics;
}>;

export default class HUDRenderer implements Renderer {
  private readonly textRenderer: TextRenderer;
  private readonly graphics: Graphics;

  constructor({ textRenderer, graphics }: Props) {
    this.textRenderer = textRenderer;
    this.graphics = graphics;
  }

  /**
   * @override {@link Renderer#render}
   */
  render = async (context: RenderContext) => {
    await this._renderFrame(context);
    await this._renderLeftPanel(context);
    await this._renderMiddlePanel(context);
    await this._renderRightPanel(context);
  };

  private _renderFrame = async ({ session }: RenderContext) => {
    const image = await session.getImageFactory().getImage({
      filename: HUD_FILENAME,
      transparentColor: Colors.WHITE
    });
    this.graphics.drawImage(image, { x: 0, y: TOP });
  };

  /**
   * Renders the bottom-left area of the screen, showing information about the player
   */
  private _renderLeftPanel = async ({ session }: RenderContext) => {
    const playerUnit = session.getPlayerUnit();

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
      const y = top + LINE_HEIGHT * i;
      await this._drawText(
        lines[i],
        FontName.APPLE_II,
        { x: left, y },
        Colors.WHITE,
        Alignment.LEFT
      );
    }
  };

  private _renderMiddlePanel = async (context: RenderContext) => {
    const { state, session } = context;
    const top = TOP + BORDER_MARGIN + BORDER_PADDING;
    const playerUnit = session.getPlayerUnit();

    let keyNumber = 1;
    const abilities = playerUnit.getAbilities();
    for (let i = 0; i < abilities.length; i++) {
      const ability = abilities[i];
      const left =
        LEFT_PANE_WIDTH +
        BORDER_PADDING +
        (ABILITIES_INNER_MARGIN + ABILITY_ICON_WIDTH) * (keyNumber - 1);

      if (!getInnateAbilities().includes(ability.name)) {
        await this._renderAbility(ability, { x: left, y: top }, context);
        await this._drawText(
          `${keyNumber}`,
          FontName.APPLE_II,
          { x: left + 10, y: top + 24 },
          Colors.WHITE,
          Alignment.CENTER
        );
        await this._drawText(
          `${ability.manaCost}`,
          FontName.APPLE_II,
          { x: left + 10, y: top + 24 + LINE_HEIGHT },
          Colors.LIGHT_GRAY,
          Alignment.CENTER
        );
        keyNumber++;
      }
    }
  };

  private _renderRightPanel = async ({ session }: RenderContext) => {
    const playerUnit = session.getPlayerUnit();
    const turn = session.getTurn();
    const mapIndex = session.getMapIndex();

    const left = LEFT_PANE_WIDTH + MIDDLE_PANE_WIDTH + BORDER_MARGIN + BORDER_PADDING;
    const top = TOP + BORDER_MARGIN + BORDER_PADDING;

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
        Alignment.LEFT
      );
    }
  };

  private _renderAbility = async (
    ability: UnitAbility,
    topLeft: Pixel,
    { state, session }: RenderContext
  ) => {
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
      const icon = await session.getImageFactory().getImage({
        filename: `abilities/${ability.icon}`,
        paletteSwaps
      });
      this.graphics.drawImage(icon, topLeft);
    }
  };

  private _drawText = async (
    text: string,
    font: FontName,
    pixel: Pixel,
    color: Color,
    textAlign: Alignment
  ) => {
    const image = await this.textRenderer.renderText(text, font, color);
    drawAligned(image, this.graphics, pixel, textAlign);
  };
}
