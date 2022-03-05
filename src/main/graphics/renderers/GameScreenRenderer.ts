import GameState from '../../core/GameState';
import Equipment from '../../equipment/Equipment';
import { isTileRevealed } from '../../maps/MapUtils';
import Color, { Colors } from '../../types/Color';
import Coordinates from '../../geometry/Coordinates';
import Tile from '../../tiles/Tile';
import { Entity, Pixel } from '../../types/types';
import { SCREEN_HEIGHT, SCREEN_WIDTH, TILE_HEIGHT, TILE_WIDTH } from '../constants';
import ImageLoader from '../images/ImageLoader';
import { applyTransparentColor, replaceColors } from '../images/ImageUtils';
import Sprite from '../sprites/Sprite';
import Renderer from './Renderer';

const SHADOW_FILENAME = 'shadow';

class GameScreenRenderer extends Renderer {
  constructor() {
    super({
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      id: 'game_screen'
    });
  }

  _redraw = async () => {
    const { canvas, context } = this;
    context.fillStyle = Colors.BLACK;
    context.fillRect(0, 0, canvas.width, canvas.height);

    await this._renderTiles();
    await this._renderItems();
    await this._renderProjectiles();
    await this._renderDoors();
    await this._renderUnits();
  };

  private _renderElement = async (element: (Entity | Tile | Equipment), { x, y }: Coordinates) => {
    const pixel: Pixel = this._gridToPixel({ x, y });

    if (this._isPixelOnScreen(pixel)) {
      const { sprite } = element;
      if (!!sprite) {
        await this._drawSprite(sprite, pixel);
      }
    }
  };

  /**
   * Allow for a one-tile buffer in each direction
   */
  private _isPixelOnScreen = ({ x, y }: Pixel): boolean =>
    (x >= -TILE_WIDTH) &&
    (x <= this.width + TILE_WIDTH) &&
    (y >= -TILE_HEIGHT) &&
    (y <= this.height + TILE_HEIGHT);

  private _drawSprite = async (sprite: Sprite, { x, y }: Coordinates) => {
    const image = sprite.getImage();
    if (image) {
      await this.context.drawImage(image, x + sprite.dx, y + sprite.dy);
    }
  };

  /**
   * @return the top left pixel
   */
  private _gridToPixel = ({ x, y }: Coordinates): Pixel => {
    const playerUnit = GameState.getInstance().getPlayerUnit();
    return {
      x: ((x - playerUnit.x) * TILE_WIDTH) + (this.width - TILE_WIDTH) / 2,
      y: ((y - playerUnit.y) * TILE_HEIGHT) + (this.height - TILE_HEIGHT) / 2
    };
  };

  private _renderTiles = async () => {
    const state = GameState.getInstance();
    const map = state.getMap();
    const promises: Promise<any>[] = [];

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (isTileRevealed({ x, y })) {
          const tile = map.getTile({ x, y });
          if (tile) {
            promises.push(this._renderElement(tile, { x, y }));
          }
        }
      }
    }

    await Promise.all(promises);
  };

  private _renderItems = async () => {
    const state = GameState.getInstance();
    const map = state.getMap();
    const promises: Promise<any>[] = [];

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (isTileRevealed({ x, y })) {
          const item = map.getItem({ x, y });
          if (item) {
            promises.push(
              this._drawEllipse({ x, y }, Colors.DARK_GRAY)
                .then(() => this._renderElement(item, { x, y }))
            );
          }
        }
      }
    }

    await Promise.all(promises);
  };

  private _renderProjectiles = async () => {
    const state = GameState.getInstance();
    const map = state.getMap();
    const promises: Promise<any>[] = [];

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (isTileRevealed({ x, y })) {
          const projectile = map.getProjectile({ x, y });
          if (projectile) {
            promises.push(this._renderElement(projectile, { x, y }));
          }
        }
      }
    }

    await Promise.all(promises);
  };

  private _renderDoors = async () => {
    const state = GameState.getInstance();
    const map = state.getMap();
    const promises: Promise<any>[] = [];

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (isTileRevealed({ x, y })) {
          const door = map.getDoor({ x, y });
          if (door) {
            promises.push(this._renderElement(door, { x, y }));
          }
        }
      }
    }

    await Promise.all(promises);
  };

  private _renderUnits = async () => {
    const state = GameState.getInstance();
    const playerUnit = state.getPlayerUnit();
    const map = state.getMap();
    const promises: Promise<any>[] = [];

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (isTileRevealed({ x, y })) {
          const unit = map.getUnit({ x, y });
          if (unit) {
            let shadowColor: Color;
            if (unit === playerUnit) {
              shadowColor = Colors.GREEN;
            } else {
              shadowColor = Colors.DARK_GRAY;
            }

            promises.push(new Promise<void>(async (resolve) => {
              await this._drawEllipse({ x, y }, shadowColor);
              await this._renderElement(unit, { x, y });
              for (const item of unit.getEquipment().getAll()) {
                await this._renderElement(item, { x, y });
              }
              resolve();
            }));
          }
        }
      }
    }

    await Promise.all(promises);
  };

  private _drawEllipse = async ({ x, y }: Coordinates, color: Color) => {
    const { x: left, y: top } = this._gridToPixel({ x, y });
    const imageData = await ImageLoader.loadImage(SHADOW_FILENAME)
      .then(imageData => applyTransparentColor(imageData, Colors.WHITE))
      .then(imageData => replaceColors(imageData, { [Colors.BLACK]: color }));
    const imageBitmap = await createImageBitmap(imageData);
    await this.context.drawImage(imageBitmap, left, top);
  };
}

export default GameScreenRenderer;
