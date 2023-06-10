import GameState from '../../core/GameState';
import Coordinates from '../../geometry/Coordinates';
import Color from '../Color';
import Colors from '../Colors';
import { LINE_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { FontDefinition, FontRenderer } from '../FontRenderer';
import ImageFactory from '../images/ImageFactory';
import { Alignment, drawAligned } from '../RenderingUtils';
import GameScreenRenderer from './GameScreenRenderer';
import HUDRenderer from './HUDRenderer';
import InventoryRenderer from './InventoryRenderer';
import MapScreenRenderer from './MapScreenRenderer';
import Fonts from '../Fonts';
import { GameScreen } from '../../types/types';
import { Renderer } from './Renderer';
import { createCanvas } from '../../utils/dom';
import CharacterScreenRenderer from './CharacterScreenRenderer';
import { Graphics } from '../Graphics';

const GAME_OVER_FILENAME = 'gameover';
const TITLE_FILENAME = 'title';
const VICTORY_FILENAME = 'victory';

type Props = Readonly<{
  parent: Element,
  state: GameState,
  imageFactory: ImageFactory,
  fontRenderer: FontRenderer
}>;

export default class GameRenderer implements Renderer {
  private readonly buffer: OffscreenCanvas;
  private readonly bufferGraphics: Graphics;
  private readonly canvas: HTMLCanvasElement;
  private readonly _graphics: Graphics;
  private readonly gameScreenRenderer: GameScreenRenderer;
  private readonly hudRenderer: HUDRenderer;
  private readonly inventoryRenderer: InventoryRenderer;
  private readonly mapScreenRenderer: MapScreenRenderer;
  private readonly characterScreenRenderer: CharacterScreenRenderer;
  private readonly state: GameState;
  private readonly imageFactory: ImageFactory;
  private readonly fontRenderer: FontRenderer;

  constructor({
    parent,
    state,
    imageFactory,
    fontRenderer
  }: Props) {
    this.buffer = new OffscreenCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
    this.bufferGraphics = Graphics.forOffscreenCanvas(this.buffer);
    this.canvas = createCanvas({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
    this._graphics = Graphics.forCanvas(this.canvas);
    const { canvas, bufferGraphics } = this;

    this.state = state;
    this.imageFactory = imageFactory;
    this.fontRenderer = fontRenderer;
    this.gameScreenRenderer = new GameScreenRenderer({ state, imageFactory, graphics: bufferGraphics });
    this.hudRenderer = new HUDRenderer({ state, fontRenderer, imageFactory, graphics: bufferGraphics });
    this.inventoryRenderer = new InventoryRenderer({ state, fontRenderer, imageFactory, graphics: bufferGraphics });
    this.mapScreenRenderer = new MapScreenRenderer({ state, graphics: bufferGraphics });
    this.characterScreenRenderer = new CharacterScreenRenderer({ state, fontRenderer, imageFactory, graphics: bufferGraphics });

    parent.appendChild(canvas);
    canvas.tabIndex = 0;
    canvas.focus();
  }

  /**
   * @override {@link Renderer#render}
   */
  render = async () => {
    console.time('GameRenderer#render');
    const screen = this.state.getScreen();

    switch (screen) {
      case GameScreen.TITLE:
        await this._renderSplashScreen(TITLE_FILENAME, 'PRESS ENTER TO BEGIN');
        await this._drawText('PRESS SHIFT-ENTER FOR DEBUG MODE', Fonts.APPLE_II, { x: 320, y: 320 }, Colors.LIGHT_MAGENTA_CGA, Alignment.CENTER);
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
        await this._renderHelp();
        break;
      default:
        // unreachable
        throw new Error(`Invalid screen ${screen}`);
    }
    console.time('GameRenderer#copyBuffer');
    const bitmap = await this.bufferGraphics.getImageBitmap();
    this._graphics.drawImageBitmap(bitmap, { x: 0, y: 0 });
    console.timeEnd('GameRenderer#copyBuffer');
    console.timeEnd('GameRenderer#render');
  };

  private _renderGameScreen = async () => {
    const { bufferGraphics: graphics, canvas } = this;
    graphics.fillRect({ left: 0, top: 0, width: canvas.width, height: canvas.height }, Colors.BLACK);

    await this.gameScreenRenderer.render();
    await this.hudRenderer.render();
    await this._renderMessages();
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

  private _renderMessages = async () => {
    const { bufferGraphics: graphics, state } = this;
    const messages = state.getMessages().getRecentMessages(state.getTurn());

    const left = 0;
    const top = 0;

    for (let i = 0; i < messages.length; i++) {
      const y = top + (LINE_HEIGHT * i);
      graphics.fillRect({ left, top: y, width: graphics.getWidth(), height: LINE_HEIGHT }, Colors.BLACK);
      await this._drawText(messages[i], Fonts.APPLE_II, { x: left, y: y + 2 }, Colors.WHITE, Alignment.LEFT);
    }
  };

  private _renderSplashScreen = async (filename: string, text: string) => {
    const image = await this.imageFactory.getImage({ filename });
    this.bufferGraphics.drawScaledImage(image, { left: 0, top: 0, width: this.canvas.width, height: this.canvas.height });
    await this._drawText(text, Fonts.APPLE_II, { x: 320, y: 300 }, Colors.WHITE, Alignment.CENTER);
  };

  private _drawText = async (text: string, font: FontDefinition, coordinates: Coordinates, color: Color, textAlign: Alignment) => {
    const imageBitmap = await this.fontRenderer.renderText(text, font, color);
    drawAligned(imageBitmap, this.bufferGraphics, coordinates, textAlign);
  };

  private _renderHelp = async () => {
    this.bufferGraphics.fill(Colors.BLACK);

    const left = 4;
    const top = 4;

    const intro = [
      'Welcome to the Dungeon of Duzh! To escape, you must brave untold',
      'terrors on seven floors. Make use of every weapon available, hone',
      'your skills through combat, and beware the Horned Wizard.'
    ];

    const keys: [string, string][] = [
      ['WASD / Arrow keys',   'Move around, melee attack'],
      ['Tab',                 'Open inventory screen'],
      ['Enter',               'Pick up item, enter portal, go down stairs'],
      ['Number keys (1-9)',   'Special moves (press arrow to execute)'],
      ['Shift + (direction)', 'Use bow and arrows'],
      ['Alt + (direction)',   'Strafe'],
      ['M',                   'View map screen'],
      ['C',                   'View character screen'],
      ['F1',                  'View this screen']
    ];

    for (let i = 0; i < intro.length; i++) {
      const y = top + (LINE_HEIGHT * i);
      await this._drawText(intro[i], Fonts.APPLE_II, { x: left, y }, Colors.WHITE, Alignment.LEFT);
    }

    for (let i = 0; i < keys.length; i++) {
      const y = top + (LINE_HEIGHT * (i + intro.length + 2));
      this.bufferGraphics.fillRect({ left, top: y, width: this.canvas.width, height: LINE_HEIGHT }, Colors.BLACK);
      const [key, description] = keys[i];
      await this._drawText(key, Fonts.APPLE_II, { x: left, y }, Colors.WHITE, Alignment.LEFT);
      await this._drawText(description, Fonts.APPLE_II, { x: left + 200, y }, Colors.WHITE, Alignment.LEFT);
    }
  };

  getCanvas = (): HTMLCanvasElement => this.canvas;
}
