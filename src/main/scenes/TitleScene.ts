import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { ClickCommand, KeyCommand, ModifierKey } from '@lib/input/inputTypes';
import { isMobileDevice, toggleFullScreen } from '@lib/utils/dom';
import { Feature } from '@main/utils/features';
import { Graphics } from '@lib/graphics/Graphics';
import { FontName } from '@main/graphics/Fonts';
import Colors from '@main/graphics/Colors';
import { Alignment, drawAligned } from '@main/graphics/RenderingUtils';
import { Pixel } from '@lib/geometry/Pixel';
import { Color } from '@lib/graphics/Color';
import { Game } from '@main/core/Game';

const TITLE_FILENAME = 'title2';

export class TitleScene implements Scene {
  readonly name = SceneName.TITLE;

  constructor() {}

  private _handleStartGame = async (game: Game) => {
    const { state, ticker, mapController } = game;
    if (Feature.isEnabled(Feature.DEBUG_LEVEL)) {
      await mapController.loadDebugMap(game);
    } else {
      await mapController.loadFirstMap(game);
    }
    state.startGameTimer();
    state.setScene(SceneName.GAME);
    ticker.log('Welcome to the Dungeons of Duzh!', { turn: state.getTurn() });
    if (isMobileDevice()) {
      ticker.log('Press the ? icon in the upper-right for instructions.', {
        turn: state.getTurn()
      });
    } else {
      ticker.log('Press F1 for instructions.', { turn: state.getTurn() });
    }
  };

  handleKeyDown = async (command: KeyCommand, game: Game) => {
    const { key, modifiers } = command;

    switch (key) {
      case 'ENTER':
        if (modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        } else {
          await this._handleStartGame(game);
        }
        break;
    }
  };

  handleKeyUp = async () => {};

  handleClick = async (_: ClickCommand, game: Game) => {
    await this._handleStartGame(game);
  };

  render = async (game: Game, graphics: Graphics): Promise<void> => {
    const { imageFactory } = game;
    const image = await imageFactory.getImage({ filename: TITLE_FILENAME });
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
        Colors.WHITE,
        Alignment.CENTER,
        graphics,
        game
      );
    }
  };

  private _drawText = (
    text: string,
    fontName: FontName,
    pixel: Pixel,
    color: Color,
    textAlign: Alignment,
    graphics: Graphics,
    game: Game
  ) => {
    const imageData = game.textRenderer.renderText({
      text,
      fontName,
      color,
      backgroundColor: Colors.BLACK
    });
    drawAligned(imageData, graphics, pixel, textAlign);
  };
}
