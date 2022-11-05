import { revealTiles } from '../../core/actions';
import GameState from '../../core/GameState';
import Coordinates from '../../geometry/Coordinates';
import Color from '../Color';
import Colors from '../Colors';
import { LINE_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { FontDefinition, Fonts, renderFont } from '../FontRenderer';
import ImageFactory from '../images/ImageFactory';
import { Alignment, drawAligned } from '../RenderingUtils';
import BufferedRenderer from './BufferedRenderer';
import GameScreenRenderer from './GameScreenRenderer';
import HUDRenderer from './HUDRenderer';
import InventoryRenderer from './InventoryRenderer';
import MinimapRenderer from './MinimapRenderer';
import renderer from './AbstractRenderer';

const GAME_OVER_FILENAME = 'gameover';
const TITLE_FILENAME = 'title';
const VICTORY_FILENAME = 'victory';

type Props = {
  parent: Element
};

class GameRenderer extends BufferedRenderer {
  private readonly gameScreenRenderer: GameScreenRenderer;
  private readonly hudRenderer: HUDRenderer;
  private readonly inventoryRenderer: InventoryRenderer;

  constructor({ parent }: Props) {
    super({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, id: 'game' });
    this.gameScreenRenderer = new GameScreenRenderer();
    this.hudRenderer = new HUDRenderer();
    this.inventoryRenderer = new InventoryRenderer();

    const canvas = this.getCanvas();
    parent.appendChild(canvas);
    canvas.tabIndex = 0;
    canvas.focus();
  }

  /**
   * @override {@link BufferedRenderer#renderBuffer}
   */
  renderBuffer = async () => {
    const screen = GameState.getInstance().getScreen();
    switch (screen) {
      case 'TITLE':
        await this._renderSplashScreen(TITLE_FILENAME, 'PRESS ENTER TO BEGIN');
        return this._drawText('PRESS SHIFT-ENTER FOR DEBUG MODE', Fonts.APPLE_II, { x: 320, y: 320 }, Colors.LIGHT_MAGENTA_CGA, 'center');
      case 'GAME':
        return this._renderGameScreen();
      case 'INVENTORY':
        await this._renderGameScreen();
        return this._renderInventory();
      case 'VICTORY':
        return this._renderSplashScreen(VICTORY_FILENAME, 'PRESS ENTER TO PLAY AGAIN');
      case 'GAME_OVER':
        return this._renderSplashScreen(GAME_OVER_FILENAME, 'PRESS ENTER TO PLAY AGAIN');
      case 'MINIMAP':
        return this._renderMinimap();
      case 'HELP':
        return this._renderHelp();
      default:
        // unreachable
        throw new Error(`Invalid screen ${screen}`);
    }
  };

  private _renderGameScreen = async () => {
    this.bufferContext.fillStyle = Colors.BLACK.hex;
    this.bufferContext.fillRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);

    await revealTiles();
    const [gameScreenImage, hudImage] = await Promise.all([
      this.gameScreenRenderer.render(),
      this.hudRenderer.render()
    ]);
    await this.bufferContext.putImageData(gameScreenImage, 0, 0);
    await this.bufferContext.putImageData(hudImage, 0, this.height - hudImage.height);
    await this._renderMessages();
  };

  private _renderInventory = async () => {
    const image = await this.inventoryRenderer.render();
    await this.bufferContext.putImageData(image, 0, 0);
  };

  private _renderMessages = async () => {
    const { bufferContext } = this;
    const messages = GameState.getInstance().getMessages();
    bufferContext.fillStyle = Colors.BLACK.hex;

    const left = 0;
    const top = 0;

    for (let i = 0; i < messages.length; i++) {
      const y = top + (LINE_HEIGHT * i);
      bufferContext.fillStyle = Colors.BLACK.hex;
      bufferContext.fillRect(left, y, this.width, LINE_HEIGHT);
      await this._drawText(messages[i], Fonts.APPLE_II, { x: left, y: y + 2 }, Colors.WHITE, 'left');
    }
  };

  private _renderSplashScreen = async (filename: string, text: string) => {
    const image = await ImageFactory.getImage({ filename });
    this.bufferContext.drawImage(image.bitmap, 0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
    await this._drawText(text, Fonts.APPLE_II, { x: 320, y: 300 }, Colors.WHITE, 'center');
  };

  private _drawText = async (text: string, font: FontDefinition, { x, y }: Coordinates, color: Color, textAlign: Alignment) => {
    const imageBitmap = await renderFont(text, font, color);
    drawAligned(imageBitmap, this.bufferContext, { x, y }, textAlign);
  };

  private _renderMinimap = async () => {
    const minimapRenderer = new MinimapRenderer();
    const image = await minimapRenderer.render();
    this.bufferContext.putImageData(image, 0, 0);
  };

  private _renderHelp = async () => {
    this.bufferContext.fillStyle = Colors.BLACK.hex;
    this.bufferContext.fillRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);

    const left = 4;
    const top = 4;

    const intro = [
      'Welcome to the Dungeons of Duzh! To escape, you must brave untold',
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
      this.bufferContext.fillStyle = Colors.BLACK.hex;
      this.bufferContext.fillRect(left, y, this.width, LINE_HEIGHT);
      const [key, description] = keys[i];
      await this._drawText(key, Fonts.APPLE_II, { x: left, y }, Colors.WHITE, 'left');
      await this._drawText(description, Fonts.APPLE_II, { x: left + 200, y }, Colors.WHITE, 'left');
    }
  };
}

export default GameRenderer;
