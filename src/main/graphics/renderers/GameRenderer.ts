import GameState from '../../core/GameState';
import Coordinates from '../../geometry/Coordinates';
import Color from '../Color';
import Colors from '../Colors';
import { LINE_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { TextRenderer } from '../TextRenderer';
import ImageFactory from '../images/ImageFactory';
import { Alignment, drawAligned } from '../RenderingUtils';
import GameScreenRenderer from './GameScreenRenderer';
import HUDRenderer from './HUDRenderer';
import InventoryRenderer from './InventoryRenderer';
import MapScreenRenderer from './MapScreenRenderer';
import { Renderer } from './Renderer';
import { createCanvas } from '../../utils/dom';
import CharacterScreenRenderer from './CharacterScreenRenderer';
import { Graphics } from '../Graphics';
import { FontName } from '../Fonts';
import { GameScreen } from '../../core/GameScreen';
import LevelUpScreenRenderer from './LevelUpScreenRenderer';
import HelpScreenRenderer from './HelpScreenRenderer';
import Ticker from '../../core/Ticker';

const GAME_OVER_FILENAME = 'gameover';
const TITLE_FILENAME = 'title';
const VICTORY_FILENAME = 'victory';

type Props = Readonly<{
  parent: Element,
  state: GameState,
  imageFactory: ImageFactory,
  textRenderer: TextRenderer,
  ticker: Ticker
}>;

export default class GameRenderer implements Renderer {
  private readonly buffer: HTMLCanvasElement;
  private readonly bufferGraphics: Graphics;
  private readonly canvas: HTMLCanvasElement;
  private readonly _graphics: Graphics;
  private readonly gameScreenRenderer: GameScreenRenderer;
  private readonly hudRenderer: HUDRenderer;
  private readonly inventoryRenderer: InventoryRenderer;
  private readonly mapScreenRenderer: MapScreenRenderer;
  private readonly characterScreenRenderer: CharacterScreenRenderer;
  private readonly helpScreenRenderer: HelpScreenRenderer;
  private readonly levelUpScreenRenderer: LevelUpScreenRenderer;
  private readonly state: GameState;
  private readonly imageFactory: ImageFactory;
  private readonly textRenderer: TextRenderer;
  private readonly ticker: Ticker;

  constructor({
    parent,
    state,
    imageFactory,
    textRenderer,
    ticker
  }: Props) {
    this.buffer = createCanvas({
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      offscreen: true
    });
    this.bufferGraphics = Graphics.forCanvas(this.buffer);
    this.canvas = createCanvas({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
    this._graphics = Graphics.forCanvas(this.canvas);
    const { canvas, bufferGraphics } = this;

    this.state = state;
    this.imageFactory = imageFactory;
    this.textRenderer = textRenderer;
    this.ticker = ticker;
    this.gameScreenRenderer = new GameScreenRenderer({ state, imageFactory, graphics: bufferGraphics });
    this.hudRenderer = new HUDRenderer({ state, textRenderer, imageFactory, graphics: bufferGraphics });
    this.inventoryRenderer = new InventoryRenderer({ state, textRenderer, imageFactory, graphics: bufferGraphics });
    this.mapScreenRenderer = new MapScreenRenderer({ state, graphics: bufferGraphics });
    this.characterScreenRenderer = new CharacterScreenRenderer({ state, textRenderer, imageFactory, graphics: bufferGraphics });
    this.helpScreenRenderer = new HelpScreenRenderer({ state, textRenderer, imageFactory, graphics: bufferGraphics });
    this.levelUpScreenRenderer = new LevelUpScreenRenderer({ state, textRenderer, imageFactory, graphics: bufferGraphics });

    parent.appendChild(canvas);
    canvas.tabIndex = 0;
    canvas.focus();
  }

  /**
   * @override {@link Renderer#render}
   */
  render = async () => {
    const screen = this.state.getScreen();

    switch (screen) {
      case GameScreen.TITLE:
        await this._renderSplashScreen(TITLE_FILENAME, 'PRESS ENTER TO BEGIN');
        await this._drawText('PRESS SHIFT-ENTER FOR DEBUG MODE', FontName.APPLE_II, { x: 320, y: 320 }, Colors.LIGHT_MAGENTA_CGA, Alignment.CENTER);
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

    requestAnimationFrame(() => {
      const imageData = this.bufferGraphics.getImageData();
      this._graphics.putImageData(imageData, { x: 0, y: 0 });
    });
  };

  private _renderGameScreen = async () => {
    const { bufferGraphics: graphics, canvas } = this;
    graphics.fillRect({ left: 0, top: 0, width: canvas.width, height: canvas.height }, Colors.BLACK);

    await this.gameScreenRenderer.render();
    await this.hudRenderer.render();
    await this._renderTicker();
  };

  private _renderInventoryScreen = async () => {
    await this.inventoryRenderer.render();
  };

  private _renderMapScreen = async () => {
    await this.mapScreenRenderer.render();
  };

  private _renderCharacterScreen = async () => {
    await this.characterScreenRenderer.render();
  };

  private _renderTicker = async () => {
    const {
      bufferGraphics: graphics,
      state,
      ticker
    } = this;
    const messages = ticker.getRecentMessages(state.getTurn());

    const left = 0;
    const top = 0;

    for (let i = 0; i < messages.length; i++) {
      const y = top + (LINE_HEIGHT * i);
      graphics.fillRect({ left, top: y, width: graphics.getWidth(), height: LINE_HEIGHT }, Colors.BLACK);
      await this._drawText(messages[i], FontName.APPLE_II, { x: left, y: y + 2 }, Colors.WHITE, Alignment.LEFT);
    }
  };

  private _renderSplashScreen = async (filename: string, text: string) => {
    const image = await this.imageFactory.getImage({ filename });
    this.bufferGraphics.drawScaledImage(image, { left: 0, top: 0, width: this.canvas.width, height: this.canvas.height });
    await this._drawText(text, FontName.APPLE_II, { x: 320, y: 300 }, Colors.WHITE, Alignment.CENTER);
  };

  private _renderHelpScreen = async () => {
    await this.helpScreenRenderer.render();
  };

  private _renderLevelUpScreen = async () => {
    await this.levelUpScreenRenderer.render();
  };

  private _drawText = async (text: string, font: FontName, coordinates: Coordinates, color: Color, textAlign: Alignment) => {
    const image = await this.textRenderer.renderText(text, font, color);
    drawAligned(image, this.bufferGraphics, coordinates, textAlign);
  };

  getCanvas = (): HTMLCanvasElement => this.canvas;
}
