import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { ClickCommand, KeyCommand, ModifierKey } from '@main/input/inputTypes';
import { Color, Graphics } from '@duzh/graphics';
import { toggleFullScreen } from '@main/utils/dom';
import { TextRenderer } from '@main/graphics/TextRenderer';
import { ImageFactory } from '@duzh/graphics/images';
import { FontName } from '@main/graphics/Fonts';
import { Alignment, drawAligned } from '@main/graphics/RenderingUtils';
import { Pixel } from '@duzh/geometry';
import { Game } from '@main/core/Game';
import { InterfaceColors } from '@main/graphics/InterfaceColors';

const BACKGROUND_FILENAME = 'bordered_background';
const LINE_HEIGHT = 15;

export class CharacterScene implements Scene {
  readonly name = SceneName.CHARACTER;

  constructor(
    private readonly game: Game,
    private readonly textRenderer: TextRenderer,
    private readonly imageFactory: ImageFactory
  ) {}

  handleKeyDown = async (command: KeyCommand) => {
    const { state } = this.game;

    switch (command.key) {
      case 'C':
        state.setScene(SceneName.GAME);
        break;
      case 'F1':
        state.setScene(SceneName.HELP);
        break;
      case 'ENTER':
        if (command.modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        }
        break;
      case 'ESCAPE':
        state.setScene(SceneName.GAME);
    }
  };

  handleKeyUp = async () => {};

  handleClick = async (_: ClickCommand) => {
    const { state } = this.game;
    state.setScene(SceneName.GAME);
  };

  render = async (graphics: Graphics) => {
    const { imageFactory } = this;
    const image = await imageFactory.getImage({ filename: BACKGROUND_FILENAME });
    graphics.drawScaledImage(image, {
      left: 0,
      top: 0,
      width: this.game.config.screenWidth,
      height: this.game.config.screenHeight
    });

    await this._renderStatistics(graphics);
  };

  private _renderStatistics = async (graphics: Graphics) => {
    const { state } = this.game;
    const playerUnit = state.getPlayerUnit();
    let top = 20;
    this._drawText(
      'Character Statistics',
      FontName.APPLE_II,
      { x: graphics.getWidth() / 2, y: top },
      InterfaceColors.WHITE,
      Alignment.CENTER,
      graphics
    );

    top += 20;

    {
      const lines = [
        `Life: ${playerUnit.getLife()}`,
        `Life per Turn: ${playerUnit.getLifePerTurn()}`,
        `Mana: ${playerUnit.getMaxMana()}`,
        `Mana per Turn: ${playerUnit.getManaPerTurn()}`,
        `Melee Damage: ${playerUnit.getMeleeDamage()}`,
        `Ranged Damage: ${playerUnit.getRangedDamage()}`
      ];
      for (const line of lines) {
        this._drawText(
          line,
          FontName.APPLE_II,
          { x: 20, y: top },
          InterfaceColors.WHITE,
          Alignment.LEFT,
          graphics
        );
        top += LINE_HEIGHT;
      }
    }

    top += 20;

    {
      const lines = [
        `Kills: ${playerUnit.getLifetimeKills()}`,
        `Damage Dealt: ${playerUnit.getLifetimeDamageDealt()}`,
        `Damage Taken: ${playerUnit.getLifetimeDamageTaken()}`,
        `Mana Spent: ${playerUnit.getLifetimeManaSpent()}`,
        `Steps Taken: ${playerUnit.getLifetimeStepsTaken()}`
      ];
      for (const line of lines) {
        this._drawText(
          line,
          FontName.APPLE_II,
          { x: 20, y: top },
          InterfaceColors.WHITE,
          Alignment.LEFT,
          graphics
        );
        top += LINE_HEIGHT;
      }
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
      backgroundColor: InterfaceColors.BLACK
    });
    drawAligned(imageData, graphics, pixel, textAlign);
  };
}
