import { Renderer } from './Renderer';
import Colors from '../Colors';
import { LINE_HEIGHT } from '../constants';
import { TextRenderer } from '../TextRenderer';
import { Alignment, drawAligned } from '../RenderingUtils';
import { FontName } from '../Fonts';
import { Graphics } from '@lib/graphics/Graphics';
import { Coordinates } from '@lib/geometry/Coordinates';
import { createCanvas } from '@lib/utils/dom';
import { GameScreen } from '@main/core/GameScreen';
import { Feature } from '@main/utils/features';
import { Session } from '@main/core/Session';
import { GameConfig } from '@main/core/GameConfig';
import GameScreenRenderer from '@main/graphics/renderers/GameScreenRenderer';
import HUDRenderer from '@main/graphics/renderers/HUDRenderer';
import InventoryRenderer from '@main/graphics/renderers/InventoryRenderer';
import MapScreenRenderer from '@main/graphics/renderers/MapScreenRenderer';
import CharacterScreenRenderer from '@main/graphics/renderers/CharacterScreenRenderer';
import HelpScreenRenderer from '@main/graphics/renderers/HelpScreenRenderer';
import ImageFactory from '@lib/graphics/images/ImageFactory';
import { Color } from '@lib/graphics/Color';
import { formatTimestamp } from '@lib/utils/time';
import { inject, injectable } from 'inversify';

const GAME_OVER_FILENAME = 'gameover';
const TITLE_FILENAME = 'title2';
const VICTORY_FILENAME = 'victory2';

@injectable()
export default class GameRenderer implements Renderer {
  private readonly buffer: HTMLCanvasElement;
  private readonly bufferGraphics: Graphics;

  /**
   * This constructor actually needs @inject annotations
   * because we are injecting specific Renderer impls but
   * only typing them as the parent type
   */
  constructor(
    @inject(GameConfig)
    gameConfig: GameConfig,
    @inject(Session)
    private readonly session: Session,
    @inject(ImageFactory)
    private readonly imageFactory: ImageFactory,
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer,
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
    private readonly helpScreenRenderer: Renderer
  ) {
    this.buffer = createCanvas({
      width: gameConfig.screenWidth,
      height: gameConfig.screenHeight,
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
      case GameScreen.TITLE: {
        await this._renderSplashScreen(TITLE_FILENAME);
        const halfSeconds = Math.floor(new Date().getTime() / 500);
        if (halfSeconds % 2 === 0) {
          await this._drawText(
            'PRESS ENTER TO BEGIN',
            FontName.APPLE_II,
            { x: 320, y: 300 },
            Colors.WHITE,
            Alignment.CENTER
          );
        }
        break;
      }
      case GameScreen.GAME:
        await this._renderGameScreen();
        break;
      case GameScreen.INVENTORY:
        await this._renderInventoryScreen();
        break;
      case GameScreen.CHARACTER:
        await this._renderCharacterScreen();
        break;
      case GameScreen.VICTORY: {
        await this._renderSplashScreen(VICTORY_FILENAME);
        const elapsedTurns = session.getTurn();
        const elapsedTime = formatTimestamp(session.getElapsedTime());
        const lines = [
          `Finished in ${elapsedTurns} turns (${elapsedTime})`,
          'PRESS ENTER TO PLAY AGAIN'
        ];
        let y = 300;
        for (const line of lines) {
          await this._drawText(
            line,
            FontName.APPLE_II,
            { x: 320, y },
            Colors.WHITE,
            Alignment.CENTER
          );
          y += 20;
        }
        break;
      }
      case GameScreen.GAME_OVER:
        await this._renderSplashScreen(GAME_OVER_FILENAME);
        await this._drawText(
          'PRESS ENTER TO PLAY AGAIN',
          FontName.APPLE_II,
          { x: 320, y: 300 },
          Colors.WHITE,
          Alignment.CENTER
        );
        break;
      case GameScreen.MAP:
        await this._renderMapScreen();
        break;
      case GameScreen.HELP:
        await this._renderHelpScreen();
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

  private _renderSplashScreen = async (filename: string) => {
    const image = await this.imageFactory.getImage({ filename });
    this.bufferGraphics.drawScaledImage(image, {
      left: 0,
      top: 0,
      width: this.bufferGraphics.getWidth(),
      height: this.bufferGraphics.getHeight()
    });
  };

  private _renderHelpScreen = async () => {
    await this.helpScreenRenderer.render(this.bufferGraphics);
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
