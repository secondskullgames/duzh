import GameState from '../core/GameState';
import Tile from '../types/Tile';
import { LINE_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH, TILE_HEIGHT, TILE_WIDTH } from './constants';
import HUDRenderer from './HUDRenderer';
import InventoryRenderer from './InventoryRenderer';
import { Alignment, drawAligned } from './RenderingUtils';
import Sprite from './sprites/Sprite';
import Color from '../types/Color';
import MinimapRenderer from './MinimapRenderer';
import BufferedRenderer from './BufferedRenderer';
import { renderFont, FontDefinition, Fonts } from './FontRenderer';
import { isTileRevealed } from '../maps/MapUtils';
import { Coordinates, Entity, GameScreen } from '../types/types';
import { applyTransparentColor, replaceColors } from './images/ImageUtils';
import Equipment from '../items/equipment/Equipment';
import ImageLoader from './images/ImageLoader';
import { revealTiles } from '../core/actions';

const GAME_OVER_FILENAME = 'gameover';
const TITLE_FILENAME = 'title';
const VICTORY_FILENAME = 'victory';
const SHADOW_FILENAME = 'shadow';

class GameRenderer extends BufferedRenderer {
  private readonly hudRenderer: HUDRenderer;
  private readonly inventoryRenderer: InventoryRenderer;

  constructor() {
    super({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
    this.hudRenderer = new HUDRenderer();
    this.inventoryRenderer = new InventoryRenderer();
    this.canvas.classList.add('game');
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
    await this._renderTiles();
    await this._renderItems();
    await this._renderProjectiles();
    await this._renderUnits();
    await this._renderMessages();
    await this._renderHUD();
  };

  private _renderTiles = async () => {
    const state = GameState.getInstance();
    const map = state.getMap();
    const promises: Promise<any>[] = [];
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (isTileRevealed({ x, y })) {
          const tile = map.getTile({ x, y });
          if (!!tile) {
            promises.push(this._renderElement(tile, { x, y }));
          }
        }
      }
    }
    return Promise.all(promises);
  };

  private _renderItems = async () => {
    const state = GameState.getInstance();
    const map = state.getMap();
    const promises: Promise<any>[] = [];
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (isTileRevealed({ x, y })) {
          const item = map.getItem({ x, y });
          if (!!item) {
            promises.push(
              this._drawEllipse({ x, y }, Color.DARK_GRAY)
                .then(() => this._renderElement(item, { x, y }))
            );
          }
        }
      }
    }
    return Promise.all(promises);
  };

  private _renderProjectiles = async () => {
    const state = GameState.getInstance();
    const map = state.getMap();
    const promises: Promise<any>[] = [];
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (isTileRevealed({ x, y })) {
          const projectile = map.projectiles.find(p => Coordinates.equals(p, { x, y }));
          if (!!projectile) {
            promises.push(this._renderElement(projectile, { x, y }));
          }
        }
      }
    }
    return Promise.all(promises);
  };

  private _renderUnits = async () => {
    const state = GameState.getInstance();
    const { playerUnit } = state;
    const map = state.getMap();
    const promises: Promise<any>[] = [];

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (isTileRevealed({ x, y })) {
          const unit = map.getUnit({ x, y });
          if (!!unit) {
            let shadowColor: Color;
            if (unit === playerUnit) {
              shadowColor = Color.GREEN;
            } else {
              shadowColor = Color.DARK_GRAY;
            }

            promises.push(new Promise<void>(async (resolve) => {
              await this._drawEllipse({ x, y }, shadowColor);
              await this._renderElement(unit, { x, y });
              for (const item of unit.equipment.getValues()) {
                await this._renderElement(item, { x, y });
              }
              resolve();
            }));
          }
        }
      }
    }
    return Promise.all(promises);
  };

  /**
   * @param color (in hex form)
   */
  private _drawEllipse = async ({ x, y }: Coordinates, color: Color) => {
    const { x: left, y: top } = this._gridToPixel({ x, y });
    const imageData = await ImageLoader.loadImage(SHADOW_FILENAME)
      .then(imageData => applyTransparentColor(imageData, Color.WHITE))
      .then(imageData => replaceColors(imageData, { [Color.BLACK]: color }));
    const imageBitmap = await createImageBitmap(imageData);
    await this.bufferContext.drawImage(imageBitmap, left, top);
  };

  private _renderInventory = async () => {
    const imageBitmap = await this.inventoryRenderer.render();
    await this.bufferContext.drawImage(imageBitmap, 0, 0);
  };

  private _isPixelOnScreen = ({ x, y }: Coordinates): boolean => {
    return (
      (x >= -TILE_WIDTH) &&
      (x <= this.width + TILE_WIDTH) &&
      (y >= -TILE_HEIGHT) &&
      (y <= this.height + TILE_HEIGHT)
    );
  };

  private _renderElement = async (element: (Entity | Tile | Equipment), { x, y }: Coordinates) => {
    const pixel: Coordinates = this._gridToPixel({ x, y });

    if (this._isPixelOnScreen(pixel)) {
      const { sprite } = element;
      if (!!sprite) {
        await this._drawSprite(sprite, pixel);
      }
    }
  };

  private _drawSprite = async (sprite: Sprite, { x, y }: Coordinates) => {
    const image = sprite.getImage();
    if (image) {
      await this.bufferContext.drawImage(image, x + sprite.dx, y + sprite.dy);
    }
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

  /**
   * @return the top left pixel
   */
  private _gridToPixel = ({ x, y }: Coordinates): Coordinates => {
    const { playerUnit } = GameState.getInstance();
    return {
      x: ((x - playerUnit.x) * TILE_WIDTH) + (this.width - TILE_WIDTH) / 2,
      y: ((y - playerUnit.y) * TILE_HEIGHT) + (this.height - TILE_HEIGHT) / 2
    };
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
