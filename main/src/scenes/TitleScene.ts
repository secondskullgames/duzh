import { Feature } from '@duzh/features';
import { Pixel } from '@duzh/geometry';
import { Color, Graphics } from '@duzh/graphics';
import { ImageFactory } from '@duzh/graphics/images';
import { Game } from '@main/core/Game';
import { FontName } from '@main/graphics/Fonts';
import { InterfaceColors } from '@main/graphics/InterfaceColors';
import { Alignment, drawAligned } from '@main/graphics/RenderingUtils';
import { TextRenderer } from '@main/graphics/TextRenderer';
import { ClickCommand, KeyCommand, ModifierKey } from '@main/input/inputTypes';
import { MapController } from '@main/maps/MapController';
import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { isMobileDevice, toggleFullScreen } from '@main/utils/dom';

const TITLE_FILENAME = 'title2';

export class TitleScene implements Scene {
  readonly name = SceneName.TITLE;

  constructor(
    private readonly game: Game,
    private readonly mapController: MapController,
    private readonly imageFactory: ImageFactory,
    private readonly textRenderer: TextRenderer
  ) {}

  private _handleStartGame = async () => {
    const { game, mapController } = this;
    const { state, ticker } = game;
    if (Feature.isEnabled(Feature.DEBUG_LEVEL)) {
      await mapController.loadDebugMap(game);
    } else {
      await mapController.loadFirstMap(game);
    }
    state.startGameTimer();
    state.setScene(SceneName.GAME);
    ticker.log('Welcome to the Dungeons of Duzh!', { turn: state.getTurn() });
    if (Feature.isEnabled(Feature.GOD_MODE)) {
      const playerUnit = state.getPlayerUnit();
      game.ticker.log('You are a god! Use your power wisely.', { turn: state.getTurn() });
      const sword = await game.itemFactory.createEquipment('god_sword');
      sword.attach(playerUnit);
      playerUnit.getEquipment().add(sword);
      const armor = await game.itemFactory.createEquipment('god_armor');
      armor.attach(playerUnit);
      playerUnit.getEquipment().add(armor);
      // gods don't need instructions
    } else if (isMobileDevice()) {
      ticker.log('Press the ? icon in the upper-right for instructions.', {
        turn: state.getTurn()
      });
    } else {
      ticker.log('Press F1 for instructions.', { turn: state.getTurn() });
    }
  };

  handleKeyDown = async (command: KeyCommand) => {
    const { key, modifiers } = command;

    switch (key) {
      case 'ENTER':
        if (modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        } else {
          await this._handleStartGame();
        }
        break;
    }
  };

  handleKeyUp = async () => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleClick = async (_: ClickCommand) => {
    await this._handleStartGame();
  };

  render = async (graphics: Graphics): Promise<void> => {
    const image = await this.imageFactory.getImage({ filename: TITLE_FILENAME });
    graphics.drawScaledImage(image, {
      left: 0,
      top: 0,
      width: graphics.getWidth(),
      height: graphics.getHeight()
    });
    const halfSeconds = Math.floor(new Date().getTime() / 500);
    if (halfSeconds % 2 === 0) {
      this._drawText(
        'PRESS ENTER TO BEGIN',
        FontName.APPLE_II,
        { x: 320, y: 300 },
        InterfaceColors.WHITE,
        Alignment.CENTER,
        graphics
      );
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
