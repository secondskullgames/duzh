import GameScreenRenderer from './GameScreenRenderer';
import HUDRenderer from './HUDRenderer';
import MapScreenRenderer from './MapScreenRenderer';
import { Renderer } from './Renderer';
import CharacterScreenRenderer from './CharacterScreenRenderer';
import LevelUpScreenRenderer from './LevelUpScreenRenderer';
import HelpScreenRenderer from './HelpScreenRenderer';
import InventoryRenderer from './InventoryRenderer';
import { Color } from '../Color';
import { Colors } from '../Colors';
import { LINE_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import ImageFactory from '../images/ImageFactory';
import { Graphics } from '../Graphics';
import { FontName } from '../Fonts';
import { Alignment, drawAligned, TextRenderer } from '@main/graphics';
import { createCanvas } from '@main/utils/dom';
import { GameScreen } from '@main/core/GameScreen';
import { Feature } from '@main/utils/features';
import { Session } from '@main/core/Session';
import { Coordinates } from '@main/geometry';
import { inject, injectable } from 'inversify';

const GAME_OVER_FILENAME = 'gameover';
const TITLE_FILENAME = 'title2';
const VICTORY_FILENAME = 'victory';

@injectable()
export default class GameRenderer implements Renderer {
  private readonly buffer: HTMLCanvasElement;
  private readonly bufferGraphics: Graphics;

  constructor(
    @inject(ImageFactory)
    private readonly imageFactory: ImageFactory,
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer,
    @inject(Session.SYMBOL)
    private readonly session: Session,
    @inject(GameScreenRenderer)
    private readonly gameScreenRenderer: Renderer,
    @inject(HUDRenderer)
    private readonly hudRenderer: Renderer,
    @inject(InventoryRenderer)
    private readonly inventoryRenderer: Renderer,
    @inject(MapScreenRenderer)
    private readonly mapScreenRenderer: Renderer,
    @inject(CharacterScreenRenderer)
    private readonly characterScreenRenderer: Renderer,
    @inject(HelpScreenRenderer)
    private readonly helpScreenRenderer: Renderer,
    @inject(LevelUpScreenRenderer)
    private readonly levelUpScreenRenderer: Renderer
  ) {
    this.buffer = createCanvas({
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      offscreen: true
    });
    this.bufferGraphics = Graphics.forCanvas(this.buffer);

    this.imageFactory = imageFactory;
    this.textRenderer = textRenderer;
  }

  /**
   * @override {@link Renderer#render}
   */
  render = async (graphics: Graphics) => {
    const { session } = this;
    const screen = session.getScreen();

    switch (screen) {
      case GameScreen.TITLE:
        await this._renderSplashScreen(TITLE_FILENAME, 'PRESS ENTER TO BEGIN');
        if (Feature.isEnabled(Feature.DEBUG_LEVEL)) {
          await this._drawText(
            'PRESS SHIFT-ENTER FOR DEBUG MODE',
            FontName.APPLE_II,
            { x: 320, y: 320 },
            Colors.LIGHT_MAGENTA_CGA,
            Alignment.CENTER
          );
        }
        break;
      case GameScreen.GAME:
        await this._renderGameScreen();
        break;
      case GameScreen.INVENTORY:
        await this._renderInventoryScreen();
        break;
      case GameScreen.CHARACTER:
        await this._renderCharacterScreen();
        break;
      case GameScreen.VICTORY:
        await this._renderSplashScreen(VICTORY_FILENAME, 'PRESS ENTER TO PLAY AGAIN');
        break;
      case GameScreen.GAME_OVER:
        await this._renderSplashScreen(GAME_OVER_FILENAME, 'PRESS ENTER TO PLAY AGAIN');
        break;
      case GameScreen.MAP:
        await this._renderMapScreen();
        break;
      case GameScreen.HELP:
        await this._renderHelpScreen();
        break;
      case GameScreen.LEVEL_UP:
        await this._renderLevelUpScreen();
        break;
      default:
        // unreachable
        throw new Error(`Invalid screen ${screen}`);
    }

    const imageData = this.bufferGraphics.getImageData();
    graphics.putImageData(imageData, { x: 0, y: 0 });
  };

  private _renderGameScreen = async () => {
    // TODO Ideally this would logic would be part of GameScreenRenderer
    const { bufferGraphics } = this;
    bufferGraphics.fillRect(
      {
        left: 0,
        top: 0,
        width: bufferGraphics.getWidth(),
        height: bufferGraphics.getHeight()
      },
      Colors.BLACK
    );

    await this.gameScreenRenderer.render(bufferGraphics);
    await this.hudRenderer.render(bufferGraphics);
    await this._renderTicker();

    if (Feature.isEnabled(Feature.BUSY_INDICATOR)) {
      if (this.session.isTurnInProgress()) {
        this._drawTurnProgressIndicator();
      }
    }
  };

  private _renderInventoryScreen = async () => {
    await this.inventoryRenderer.render(this.bufferGraphics);
  };

  private _renderMapScreen = async () => {
    await this.mapScreenRenderer.render(this.bufferGraphics);
  };

  private _renderCharacterScreen = async () => {
    await this.characterScreenRenderer.render(this.bufferGraphics);
  };

  private _renderTicker = async () => {
    const { bufferGraphics: graphics, session } = this;
    const messages = session.getTicker().getRecentMessages(session.getTurn());

    const left = 0;
    const top = 0;

    for (let i = 0; i < messages.length; i++) {
      const y = top + LINE_HEIGHT * i;
      graphics.fillRect(
        { left, top: y, width: graphics.getWidth(), height: LINE_HEIGHT },
        Colors.BLACK
      );
      await this._drawText(
        messages[i],
        FontName.APPLE_II,
        { x: left, y: y + 2 },
        Colors.WHITE,
        Alignment.LEFT
      );
    }
  };

  private _drawTurnProgressIndicator = () => {
    const graphics = this.bufferGraphics;
    if (this.session.isTurnInProgress()) {
      const width = 20;
      const height = 20;
      const left = graphics.getWidth() - width;
      const top = 0;
      const rect = { left, top, width, height };
      graphics.fillRect(rect, Colors.DARK_GRAY);
    }
  };

  private _renderSplashScreen = async (filename: string, text: string) => {
    const image = await this.imageFactory.getImage({ filename });
    this.bufferGraphics.drawScaledImage(image, {
      left: 0,
      top: 0,
      width: this.bufferGraphics.getWidth(),
      height: this.bufferGraphics.getHeight()
    });
    await this._drawText(
      text,
      FontName.APPLE_II,
      { x: 320, y: 300 },
      Colors.WHITE,
      Alignment.CENTER
    );
  };

  private _renderHelpScreen = async () => {
    await this.helpScreenRenderer.render(this.bufferGraphics);
  };

  private _renderLevelUpScreen = async () => {
    await this.levelUpScreenRenderer.render(this.bufferGraphics);
  };

  private _drawText = async (
    text: string,
    font: FontName,
    coordinates: Coordinates,
    color: Color,
    textAlign: Alignment
  ) => {
    const image = await this.textRenderer.renderText(text, font, color);
    drawAligned(image, this.bufferGraphics, coordinates, textAlign);
  };
}
