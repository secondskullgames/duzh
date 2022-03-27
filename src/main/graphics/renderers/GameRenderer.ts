import { revealTiles } from '../../core/actions';
import GameState from '../../core/GameState';
import Coordinates from '../../geometry/Coordinates';
import { tail } from '../../utils/arrays';
import Color from '../Color';
import Colors from '../Colors';
import { LINE_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { FontDefinition, Fonts, renderFont } from '../FontRenderer';
import ImageLoader from '../images/ImageLoader';
import { Alignment, drawAligned } from '../RenderingUtils';
import BufferedRenderer from './BufferedRenderer';
import GameScreenRenderer from './GameScreenRenderer';
import HUDRenderer from './HUDRenderer';
import InventoryRenderer from './InventoryRenderer';
import MinimapRenderer from './MinimapRenderer';

const GAME_OVER_FILENAME = 'gameover';
const TITLE_FILENAME = 'title';
const VICTORY_FILENAME = 'victory';

class GameRenderer extends BufferedRenderer {
  private readonly gameScreenRenderer: GameScreenRenderer;
  private readonly hudRenderer: HUDRenderer;
  private readonly inventoryRenderer: InventoryRenderer;

  constructor() {
    super({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, id: 'game' });
    this.gameScreenRenderer = new GameScreenRenderer();
    this.hudRenderer = new HUDRenderer();
    this.inventoryRenderer = new InventoryRenderer();
    this.getCanvas().tabIndex = 0;
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
      default:
        // unreachable
        throw new Error(`Invalid screen ${screen}`);
    }
  };

  private _renderGameScreen = async () => {
    this.bufferContext.fillStyle = Colors.BLACK.hex;
    this.bufferContext.fillRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);

    await revealTiles();
    const [gameScreenBitmap, hudBitmap] = await Promise.all([
      this.gameScreenRenderer.render(),
      this.hudRenderer.render()
    ]);
    await this.bufferContext.drawImage(gameScreenBitmap, 0, 0);
    await this.bufferContext.drawImage(hudBitmap, 0, this.height - hudBitmap.height, hudBitmap.width, hudBitmap.height);
    await this._renderMessages();
  };

  private _renderInventory = async () => {
    const imageBitmap = await this.inventoryRenderer.render();
    await this.bufferContext.drawImage(imageBitmap, 0, 0);
  };

  private _renderMessages = async () => {
    const { bufferContext } = this;
    const messages = tail(GameState.getInstance().getMessages(), 3);
    bufferContext.fillStyle = Colors.BLACK.hex;

    const left = 0;
    const top = 0;

    for (let i = 0; i < messages.length; i++) {
      const y = top + (LINE_HEIGHT * i);
      bufferContext.fillStyle = Colors.BLACK.hex;
      bufferContext.fillRect(left, y, this.width, LINE_HEIGHT);
      await this._drawText(messages[i], Fonts.APPLE_II, { x: left, y }, Colors.WHITE, 'left');
    }
  };

  private _renderSplashScreen = async (filename: string, text: string) => {
    const imageData = await ImageLoader.loadImage(filename);
    const imageBitmap = await createImageBitmap(imageData);
    await this.bufferContext.drawImage(imageBitmap, 0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
    await this._drawText(text, Fonts.APPLE_II, { x: 320, y: 300 }, Colors.WHITE, 'center');
  };

  private _drawText = async (text: string, font: FontDefinition, { x, y }: Coordinates, color: Color, textAlign: Alignment) => {
    const imageBitmap = await renderFont(text, font, color);
    await drawAligned(imageBitmap, this.bufferContext, { x, y }, textAlign);
  };

  private _renderMinimap = async () => {
    const minimapRenderer = new MinimapRenderer();
    const bitmap = await minimapRenderer.render();
    await this.bufferContext.drawImage(bitmap, 0, 0);
  };
}

export default GameRenderer;
