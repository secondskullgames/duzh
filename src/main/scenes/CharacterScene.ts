import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { ClickCommand, KeyCommand, ModifierKey } from '@lib/input/inputTypes';
import { Graphics } from '@lib/graphics/Graphics';
import { toggleFullScreen } from '@lib/utils/dom';
import { GameConfig } from '@main/core/GameConfig';
import { TextRenderer } from '@main/graphics/TextRenderer';
import ImageFactory from '@lib/graphics/images/ImageFactory';
import { FontName } from '@main/graphics/Fonts';
import Colors from '@main/graphics/Colors';
import { Alignment, drawAligned } from '@main/graphics/RenderingUtils';
import { Pixel } from '@lib/geometry/Pixel';
import { Color } from '@lib/graphics/Color';
import { Engine } from '@main/core/Engine';
import { inject, injectable } from 'inversify';

const BACKGROUND_FILENAME = 'bordered_background';
const LINE_HEIGHT = 15;

@injectable()
export class CharacterScene implements Scene {
  readonly name = SceneName.CHARACTER;

  constructor(
    @inject(GameConfig)
    private readonly gameConfig: GameConfig,
    @inject(Engine)
    private readonly engine: Engine,
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer,
    @inject(ImageFactory)
    private readonly imageFactory: ImageFactory
  ) {}

  handleKeyDown = async (command: KeyCommand) => {
    const { engine } = this;
    const session = engine.getSession();

    switch (command.key) {
      case 'C':
        session.setScene(SceneName.GAME);
        break;
      case 'F1':
        session.setScene(SceneName.HELP);
        break;
      case 'ENTER':
        if (command.modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        }
        break;
      case 'ESCAPE':
        session.setScene(SceneName.GAME);
    }
  };

  handleKeyUp = async () => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleClick = async (_: ClickCommand) => {
    const { engine } = this;
    const session = engine.getSession();
    session.setScene(SceneName.GAME);
  };

  render = async (graphics: Graphics) => {
    const { imageFactory } = this;
    const image = await imageFactory.getImage({ filename: BACKGROUND_FILENAME });
    graphics.drawScaledImage(image, {
      left: 0,
      top: 0,
      width: this.gameConfig.screenWidth,
      height: this.gameConfig.screenHeight
    });

    await this._renderStatistics(graphics);
  };

  private _renderStatistics = async (graphics: Graphics) => {
    const { engine } = this;
    const session = engine.getSession();
    const playerUnit = session.getPlayerUnit();
    let top = 20;
    this._drawText(
      'Character Statistics',
      FontName.APPLE_II,
      { x: graphics.getWidth() / 2, y: top },
      Colors.WHITE,
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
          Colors.WHITE,
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
          Colors.WHITE,
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
      backgroundColor: Colors.BLACK
    });
    drawAligned(imageData, graphics, pixel, textAlign);
  };
}
