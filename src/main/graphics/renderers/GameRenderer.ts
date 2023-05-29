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
import MinimapRenderer from './MinimapRenderer';
import Fonts from '../Fonts';
import { GameScreen } from '../../types/types';
import { Renderer } from './Renderer';
import { createCanvas, getCanvasContext } from '../../utils/dom';

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
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly gameScreenRenderer: GameScreenRenderer;
  private readonly hudRenderer: HUDRenderer;
  private readonly inventoryRenderer: InventoryRenderer;
  private readonly minimapRenderer: MinimapRenderer;
  private readonly state: GameState;
  private readonly imageFactory: ImageFactory;
  private readonly fontRenderer: FontRenderer;

  constructor({
    parent,
    state,
    imageFactory,
    fontRenderer
  }: Props) {
    this.canvas = createCanvas({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
    this.context = getCanvasContext(this.canvas);
    const { canvas, context } = this;

    this.state = state;
    this.imageFactory = imageFactory;
    this.fontRenderer = fontRenderer;
    this.gameScreenRenderer = new GameScreenRenderer({ state, imageFactory, context });
    this.hudRenderer = new HUDRenderer({ state, fontRenderer, imageFactory, context });
    this.inventoryRenderer = new InventoryRenderer({ state, fontRenderer, imageFactory, context });
    this.minimapRenderer = new MinimapRenderer({ state, context });

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
        await this._drawText('PRESS SHIFT-ENTER FOR DEBUG MODE', Fonts.APPLE_II, { x: 320, y: 320 }, Colors.LIGHT_MAGENTA_CGA, 'center');
        break;
      case GameScreen.GAME:
        await this._renderGameScreen();
        break;
      case GameScreen.INVENTORY:
        await this._renderGameScreen();
        await this._renderInventory();
        break;
      case GameScreen.VICTORY:
        await this._renderSplashScreen(VICTORY_FILENAME, 'PRESS ENTER TO PLAY AGAIN');
        break;
      case GameScreen.GAME_OVER:
        await this._renderSplashScreen(GAME_OVER_FILENAME, 'PRESS ENTER TO PLAY AGAIN');
        break;
      case GameScreen.MAP:
        await this._renderMinimap();
        break;
      case GameScreen.HELP:
        await this._renderHelp();
        break;
      default:
        // unreachable
        throw new Error(`Invalid screen ${screen}`);
    }
    console.timeEnd('GameRenderer#render');
  };

  private _renderGameScreen = async () => {
    const { context, canvas } = this;
    context.fillStyle = Colors.BLACK.hex;
    context.fillRect(0, 0, canvas.width, canvas.height);

    await this.gameScreenRenderer.render();
    await this.hudRenderer.render();
    await this._renderMessages();
  };

  private _renderInventory = async () => {
    await this.inventoryRenderer.render();
  };

  private _renderMessages = async () => {
    const { context, state } = this;
    const { canvas } = context;
    const messages = state.getMessages().getRecentMessages(state.getTurn());
    context.fillStyle = Colors.BLACK.hex;

    const left = 0;
    const top = 0;

    for (let i = 0; i < messages.length; i++) {
      const y = top + (LINE_HEIGHT * i);
      context.fillStyle = Colors.BLACK.hex;
      context.fillRect(left, y, canvas.width, LINE_HEIGHT);
      await this._drawText(messages[i], Fonts.APPLE_II, { x: left, y: y + 2 }, Colors.WHITE, 'left');
    }
  };

  private _renderSplashScreen = async (filename: string, text: string) => {
    const image = await this.imageFactory.getImage({ filename });
    this.context.drawImage(image.bitmap, 0, 0, this.canvas.width, this.canvas.height);
    await this._drawText(text, Fonts.APPLE_II, { x: 320, y: 300 }, Colors.WHITE, 'center');
  };

  private _drawText = async (text: string, font: FontDefinition, coordinates: Coordinates, color: Color, textAlign: Alignment) => {
    const imageBitmap = await this.fontRenderer.renderFont(text, font, color);
    drawAligned(imageBitmap, this.context, coordinates, textAlign);
  };

  private _renderMinimap = async () => {
    await this.minimapRenderer.render();
  };

  private _renderHelp = async () => {
    this.context.fillStyle = Colors.BLACK.hex;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

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
      ['M',                   'View map'],
      ['F1',                  'View this screen']
    ];

    for (let i = 0; i < intro.length; i++) {
      const y = top + (LINE_HEIGHT * i);
      await this._drawText(intro[i], Fonts.APPLE_II, { x: left, y }, Colors.WHITE, 'left');
    }

    for (let i = 0; i < keys.length; i++) {
      const y = top + (LINE_HEIGHT * (i + intro.length + 2));
      this.context.fillStyle = Colors.BLACK.hex;
      this.context.fillRect(left, y, this.canvas.width, LINE_HEIGHT);
      const [key, description] = keys[i];
      await this._drawText(key, Fonts.APPLE_II, { x: left, y }, Colors.WHITE, 'left');
      await this._drawText(description, Fonts.APPLE_II, { x: left + 200, y }, Colors.WHITE, 'left');
    }
  };

  getCanvas = (): HTMLCanvasElement => this.canvas;
}
