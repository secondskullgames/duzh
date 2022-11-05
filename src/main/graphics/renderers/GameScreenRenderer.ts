import GameState from '../../core/GameState';
import Equipment from '../../equipment/Equipment';
import Coordinates from '../../geometry/Coordinates';
import { Pixel } from '../../types/types';
import Unit from '../../units/Unit';
import Color from '../Color';
import Colors from '../Colors';
import { SCREEN_HEIGHT, SCREEN_WIDTH, TILE_HEIGHT, TILE_WIDTH } from '../constants';
import ImageFactory from '../images/ImageFactory';
import PaletteSwaps from '../PaletteSwaps';
import Sprite from '../sprites/Sprite';
import SpriteContainer from '../sprites/SpriteContainer';
import AbstractRenderer from './AbstractRenderer';

const SHADOW_FILENAME = 'shadow';

class GameScreenRenderer extends AbstractRenderer {
  constructor() {
    super({
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      id: 'game_screen'
    });
  }

  _redraw = async () => {
    const { canvas, context } = this;
    context.fillStyle = Colors.BLACK.hex;
    context.fillRect(0, 0, canvas.width, canvas.height);

    await this._renderTiles();
    await this._renderEntities();
  };

  private _renderElement = async (element: SpriteContainer, { x, y }: Coordinates) => {
    const pixel: Pixel = this._gridToPixel({ x, y });

    if (this._isPixelOnScreen(pixel)) {
      const sprite = element.getSprite();
      if (sprite) {
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
    const image = await sprite.getImage();
    if (image) {
      this.context.drawImage(image.bitmap, x + sprite.dx, y + sprite.dy);
    }
  };

  /**
   * @return the top left pixel
   */
  private _gridToPixel = ({ x, y }: Coordinates): Pixel => {
    const playerUnit = GameState.getInstance().getPlayerUnit();
    const { x: playerX, y: playerY } = playerUnit.getCoordinates();
    return {
      x: ((x - playerX) * TILE_WIDTH) + (this.width - TILE_WIDTH) / 2,
      y: ((y - playerY) * TILE_HEIGHT) + (this.height - TILE_HEIGHT) / 2
    };
  };

  private _renderTiles = async () => {
    const state = GameState.getInstance();
    const map = state.getMap();
    const promises: Promise<any>[] = [];

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (this._isTileRevealed({ x, y })) {
          const tile = map.getTile({ x, y });
          if (tile) {
            promises.push(this._renderElement(tile, { x, y }));
          }
        }
      }
    }

    await Promise.all(promises);
  };

  /**
   * Render all entities, one row at a time.
   */
  private _renderEntities = async () => {
    const state = GameState.getInstance();
    const map = state.getMap();

    for (let y = 0; y < map.height; y++) {
      const promises: Promise<any>[] = [];

      for (let x = 0; x < map.width; x++) {
        if (this._isTileRevealed({ x, y })) {
          const item = map.getItem({ x, y });
          if (item) {
            promises.push(
              this._drawEllipse({ x, y }, Colors.DARK_GRAY)
                .then(() => this._renderElement(item, { x, y }))
            );
          }

          const projectile = map.getProjectile({ x, y });
          if (projectile) {
            promises.push(this._renderElement(projectile, { x, y }));
          }

          const door = map.getDoor({ x, y });
          if (door) {
            promises.push(this._renderElement(door, { x, y }));
          }

          const spawner = map.getSpawner({ x, y });
          if (spawner) {
            promises.push(this._renderElement(spawner, { x, y }));
          }

          const unit = map.getUnit({ x, y });
          if (unit) {
            promises.push(this._renderUnit(unit, x, y));
          }
        }
      }

      await Promise.all(promises);
    }
  };

  /**
   * Render the unit, all of its equipment, and the ceorresponding overlay.
   */
  private _renderUnit = async (unit: Unit, x: number, y: number) => {
    const behindEquipment: Equipment[] = [];
    const aheadEquipment: Equipment[] = [];
    for (const equipment of unit.getEquipment().getAll()) {
      const drawBehind: boolean = await equipment.drawBehind();
      if (drawBehind) {
        behindEquipment.push(equipment);
      } else {
        aheadEquipment.push(equipment);
      }
    }

    let shadowColor: Color;
    if (unit === GameState.getInstance().getPlayerUnit()) {
      shadowColor = Colors.GREEN;
    } else {
      shadowColor = Colors.DARK_GRAY;
    }
    await this._drawEllipse({ x, y }, shadowColor);
    for (const equipment of behindEquipment) {
      await this._renderElement(equipment, { x, y });
    }
    await this._renderElement(unit, { x, y });
    for (const equipment of aheadEquipment) {
      await this._renderElement(equipment, { x, y });
    }
  };

  private _drawEllipse = async ({ x, y }: Coordinates, color: Color) => {
    const { x: left, y: top } = this._gridToPixel({ x, y });
    const paletteSwaps = PaletteSwaps.builder()
      .addMapping(Colors.BLACK, color)
      .build();
    const image = await ImageFactory.getImage({
      filename: SHADOW_FILENAME,
      transparentColor: Colors.WHITE,
      paletteSwaps
    });
    this.context.drawImage(image.bitmap, left, top);
  };

  private _isTileRevealed = ({ x, y }: Coordinates): boolean => {
    const map = GameState.getInstance().getMap();
    return jwb.DEBUG || map.isTileRevealed({ x, y });
  };
}

export default GameScreenRenderer;
