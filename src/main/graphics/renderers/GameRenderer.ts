import GameScreenRenderer from './GameScreenRenderer';
import HUDRenderer from './HUDRenderer';
import InventoryRenderer from './InventoryRenderer';
import MapScreenRenderer from './MapScreenRenderer';
import { Renderer } from './Renderer';
import CharacterScreenRenderer from './CharacterScreenRenderer';
import LevelUpScreenRenderer from './LevelUpScreenRenderer';
import HelpScreenRenderer from './HelpScreenRenderer';
import InventoryRendererV2 from './InventoryRendererV2';
import Coordinates from '../../geometry/Coordinates';
import Color from '../Color';
import Colors from '../Colors';
import { LINE_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { TextRenderer } from '../TextRenderer';
import ImageFactory from '../images/ImageFactory';
import { Alignment, drawAligned } from '../RenderingUtils';
import { createCanvas } from '../../utils/dom';
import { Graphics } from '../Graphics';
import { FontName } from '../Fonts';
import { GameScreen } from '../../core/GameScreen';
import { Feature } from '../../utils/features';
import { Session } from '../../core/Session';

const GAME_OVER_FILENAME = 'gameover';
const TITLE_FILENAME = 'title2';
const VICTORY_FILENAME = 'victory';

type Props = Readonly<{
  parent: Element;
  imageFactory: ImageFactory;
  textRenderer: TextRenderer;
}>;

export default class GameRenderer implements Renderer {
  private readonly buffer: HTMLCanvasElement;
  private readonly bufferGraphics: Graphics;
  private readonly canvas: HTMLCanvasElement;
  private readonly _graphics: Graphics;
  private readonly gameScreenRenderer: Renderer;
  private readonly hudRenderer: Renderer;
  private readonly inventoryRenderer: Renderer;
  private readonly mapScreenRenderer: Renderer;
  private readonly characterScreenRenderer: Renderer;
  private readonly helpScreenRenderer: Renderer;
  private readonly levelUpScreenRenderer: Renderer;
  private readonly imageFactory: ImageFactory;
  private readonly textRenderer: TextRenderer;

  constructor({ parent, imageFactory, textRenderer }: Props) {
    this.buffer = createCanvas({
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      offscreen: true
    });
    this.bufferGraphics = Graphics.forCanvas(this.buffer);
    this.canvas = createCanvas({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
    this._graphics = Graphics.forCanvas(this.canvas);
    const { canvas, bufferGraphics } = this;

    this.imageFactory = imageFactory;
    this.textRenderer = textRenderer;
    this.gameScreenRenderer = new GameScreenRenderer({ graphics: bufferGraphics });
    this.hudRenderer = new HUDRenderer({ textRenderer, graphics: bufferGraphics });
    this.inventoryRenderer = Feature.isEnabled(Feature.INVENTORY_V2)
      ? new InventoryRendererV2({
          textRenderer,
          graphics: bufferGraphics
        })
      : new InventoryRenderer({
          textRenderer,
          graphics: bufferGraphics
        });
    this.mapScreenRenderer = new MapScreenRenderer({ graphics: bufferGraphics });
    this.characterScreenRenderer = new CharacterScreenRenderer({
      textRenderer,
      graphics: bufferGraphics
    });
    this.helpScreenRenderer = new HelpScreenRenderer({
      textRenderer,
      graphics: bufferGraphics
    });
    this.levelUpScreenRenderer = new LevelUpScreenRenderer({
      textRenderer,
      graphics: bufferGraphics
    });

    parent.appendChild(canvas);
    canvas.tabIndex = 0;
    canvas.focus();
  }

  /**
   * @override {@link Renderer#render}
   */
  render = async (session: Session) => {
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
        await this._renderGameScreen(session);
        break;
      case GameScreen.INVENTORY:
        await this._renderInventoryScreen(session);
        break;
      case GameScreen.CHARACTER:
        await this._renderCharacterScreen(session);
        break;
      case GameScreen.VICTORY:
        await this._renderSplashScreen(VICTORY_FILENAME, 'PRESS ENTER TO PLAY AGAIN');
        break;
      case GameScreen.GAME_OVER:
        await this._renderSplashScreen(GAME_OVER_FILENAME, 'PRESS ENTER TO PLAY AGAIN');
        break;
      case GameScreen.MAP:
        await this._renderMapScreen(session);
        break;
      case GameScreen.HELP:
        await this._renderHelpScreen(session);
        break;
      case GameScreen.LEVEL_UP:
        await this._renderLevelUpScreen(session);
        break;
      default:
        // unreachable
        throw new Error(`Invalid screen ${screen}`);
    }

    requestAnimationFrame(() => {
      const imageData = this.bufferGraphics.getImageData();
      this._graphics.putImageData(imageData, { x: 0, y: 0 });
    });
  };

  private _renderGameScreen = async (session: Session) => {
    // TODO Ideally this would logic would be part of GameScreenRenderer
    const { bufferGraphics: graphics, canvas } = this;
    graphics.fillRect(
      { left: 0, top: 0, width: canvas.width, height: canvas.height },
      Colors.BLACK
    );

    await this.gameScreenRenderer.render(session);
    await this.hudRenderer.render(session);
    await this._renderTicker(session);

    if (Feature.isEnabled(Feature.BUSY_INDICATOR)) {
      if (session.isTurnInProgress()) {
        this._drawTurnProgressIndicator(session);
      }
    }
  };

  private _renderInventoryScreen = async (session: Session) => {
    await this.inventoryRenderer.render(session);
  };

  private _renderMapScreen = async (session: Session) => {
    await this.mapScreenRenderer.render(session);
  };

  private _renderCharacterScreen = async (session: Session) => {
    await this.characterScreenRenderer.render(session);
  };

  private _renderTicker = async (session: Session) => {
    const { bufferGraphics: graphics } = this;
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

  private _drawTurnProgressIndicator = (session: Session) => {
    const graphics = this.bufferGraphics;
    if (session.isTurnInProgress()) {
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
      width: this.canvas.width,
      height: this.canvas.height
    });
    await this._drawText(
      text,
      FontName.APPLE_II,
      { x: 320, y: 300 },
      Colors.WHITE,
      Alignment.CENTER
    );
  };

  private _renderHelpScreen = async (session: Session) => {
    await this.helpScreenRenderer.render(session);
  };

  private _renderLevelUpScreen = async (session: Session) => {
    await this.levelUpScreenRenderer.render(session);
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

  getCanvas = (): HTMLCanvasElement => this.canvas;
}
