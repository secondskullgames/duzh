import GameState from '../../core/GameState';
import { LINE_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH, } from '../constants';
import GameScreenRenderer from './GameScreenRenderer';
import HUDRenderer from './HUDRenderer';
import InventoryRenderer from './InventoryRenderer';
import { Alignment, drawAligned } from '../RenderingUtils';
import Color from '../../types/Color';
import MinimapRenderer from './MinimapRenderer';
import BufferedRenderer from './BufferedRenderer';
import { renderFont, FontDefinition, Fonts } from '../FontRenderer';
import { Coordinates, GameScreen } from '../../types/types';
import ImageLoader from '../images/ImageLoader';
import { revealTiles } from '../../core/actions';

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
  }

  /**
   * @override {@link BufferedRenderer#renderBuffer}
   */
  renderBuffer = async () => {
    const { screen } = GameState.getInstance();
    switch (screen) {
      case GameScreen.TITLE:
        return this._renderSplashScreen(TITLE_FILENAME, 'PRESS ENTER TO BEGIN');
      case GameScreen.GAME:
        return this._renderGameScreen();
      case GameScreen.INVENTORY:
        return this._renderGameScreen()
          .then(() => this._renderInventory());
      case GameScreen.VICTORY:
        return this._renderSplashScreen(VICTORY_FILENAME, 'PRESS ENTER TO PLAY AGAIN');
      case GameScreen.GAME_OVER:
        return this._renderSplashScreen(GAME_OVER_FILENAME, 'PRESS ENTER TO PLAY AGAIN');
      case GameScreen.MINIMAP:
        return this._renderMinimap();
      default:
        throw `Invalid screen ${screen}`;
    }
  };

  private _renderGameScreen = async () => {
    this.bufferContext.fillStyle = Color.BLACK;
    this.bufferContext.fillRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);

    await revealTiles();
    const imageBitmap = await this.gameScreenRenderer.render();
    await this.bufferContext.drawImage(imageBitmap, 0, 0);
    await this._renderMessages();
    await this._renderHUD();
  };

  private _renderInventory = async () => {
    const imageBitmap = await this.inventoryRenderer.render();
    await this.bufferContext.drawImage(imageBitmap, 0, 0);
  };

  private _renderMessages = async () => {
    const { bufferContext } = this;
    const { messages } = GameState.getInstance();
    bufferContext.fillStyle = Color.BLACK;
    bufferContext.strokeStyle = Color.BLACK;

    const left = 0;
    const top = 0;

    for (let i = 0; i < messages.length; i++) {
      const y = top + (LINE_HEIGHT * i);
      bufferContext.fillStyle = Color.BLACK;
      bufferContext.fillRect(left, y, this.width, LINE_HEIGHT);
      await this._drawText(messages[i], Fonts.PERFECT_DOS_VGA, { x: left, y }, Color.WHITE, 'left');
    }
  };

  private _renderSplashScreen = async (filename: string, text: string) => {
    const imageData = await ImageLoader.loadImage(filename);
    const imageBitmap = await createImageBitmap(imageData);
    await this.bufferContext.drawImage(imageBitmap, 0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
    await this._drawText(text, Fonts.PERFECT_DOS_VGA, { x: 320, y: 300 }, Color.WHITE, 'center');
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

  private _renderHUD = async() => {
    const imageBitmap = await this.hudRenderer.render();
    await this.bufferContext.drawImage(imageBitmap, 0, this.height - imageBitmap.height, imageBitmap.width, imageBitmap.height);
  };
}

export default GameRenderer;
