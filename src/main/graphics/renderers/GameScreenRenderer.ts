import GameState from '../../core/GameState';
import Equipment from '../../equipment/Equipment';
import Coordinates from '../../geometry/Coordinates';
import { Pixel } from '../../types/types';
import Unit from '../../entities/units/Unit';
import Color from '../Color';
import Colors from '../Colors';
import { SCREEN_HEIGHT, SCREEN_WIDTH, TILE_HEIGHT, TILE_WIDTH } from '../constants';
import ImageFactory from '../images/ImageFactory';
import PaletteSwaps from '../PaletteSwaps';
import Sprite from '../sprites/Sprite';
import AbstractRenderer from './AbstractRenderer';

const SHADOW_FILENAME = 'shadow';

type Element = Readonly<{
  getSprite: () => Sprite | null;
}>;

type Props = Readonly<{
  state: GameState,
  imageFactory: ImageFactory
}>;

class GameScreenRenderer extends AbstractRenderer {
  private readonly state: GameState;
  private readonly imageFactory: ImageFactory;

  constructor({ state, imageFactory }: Props) {
    super({
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      id: 'game_screen'
    });
    this.state = state;
    this.imageFactory = imageFactory;
  }

  _redraw = async () => {
    const { canvas, context } = this;
    context.fillStyle = Colors.BLACK.hex;
    context.fillRect(0, 0, canvas.width, canvas.height);

    await this._renderTiles();
    await this._renderEntities();
  };

  private _renderElement = (element: Element, { x, y }: Coordinates) => {
    const pixel = this._gridToPixel({ x, y });

    if (this._isPixelOnScreen(pixel)) {
      const sprite = element.getSprite();
      if (sprite) {
        this._drawSprite(sprite, pixel);
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

  private _drawSprite = (sprite: Sprite, { x, y }: Coordinates) => {
    const image = sprite.getImage();
    if (image) {
      this.context.drawImage(image.bitmap, x + sprite.dx, y + sprite.dy);
    }
  };

  /**
   * @return the top left pixel
   */
  private _gridToPixel = ({ x, y }: Coordinates): Pixel => {
    const playerUnit = this.state.getPlayerUnit();
    const { x: playerX, y: playerY } = playerUnit.getCoordinates();
    return {
      x: ((x - playerX) * TILE_WIDTH) + (this.width - TILE_WIDTH) / 2,
      y: ((y - playerY) * TILE_HEIGHT) + (this.height - TILE_HEIGHT) / 2
    };
  };

  private _renderTiles = () => {
    const map = this.state.getMap();

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (this._isTileRevealed({ x, y })) {
          const tile = map.getTile({ x, y });
          if (tile) {
            this._renderElement(tile, { x, y });
          }
        }
      }
    }
  };

  /**
   * Render all entities, one row at a time.
   */
  private _renderEntities = async () => {
    const map = this.state.getMap();

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (this._isTileRevealed({ x, y })) {
          const item = map.getItem({ x, y });
          if (item) {
            await this._drawEllipse({ x, y }, Colors.DARK_GRAY);
            this._renderElement(item, { x, y });
          }

          const projectile = map.getProjectile({ x, y });
          if (projectile) {
            this._renderElement(projectile, { x, y });
          }

          const door = map.getDoor({ x, y });
          if (door) {
            this._renderElement(door, { x, y });
          }

          const spawner = map.getSpawner({ x, y });
          if (spawner) {
            this._renderElement(spawner, { x, y });
          }

          const unit = map.getUnit({ x, y });
          if (unit) {
            await this._renderUnit(unit, x, y);
          }
        }
      }
    }
  };

  /**
   * Render the unit, all of its equipment, and the ceorresponding overlay.
   */
  private _renderUnit = async (unit: Unit, x: number, y: number) => {
    const behindEquipment: Equipment[] = [];
    const aheadEquipment: Equipment[] = [];
    for (const equipment of unit.getEquipment().getAll()) {
      const drawBehind = equipment.drawBehind();
      if (drawBehind) {
        behindEquipment.push(equipment);
      } else {
        aheadEquipment.push(equipment);
      }
    }

    let shadowColor: Color;
    if (unit === this.state.getPlayerUnit()) {
      shadowColor = Colors.GREEN;
    } else {
      shadowColor = Colors.DARK_GRAY;
    }

    await this._drawEllipse({ x, y }, shadowColor);
    for (const equipment of behindEquipment) {
      this._renderElement(equipment, { x, y });
    }
    this._renderElement(unit, { x, y });
    for (const equipment of aheadEquipment) {
      this._renderElement(equipment, { x, y });
    }
  };

  private _drawEllipse = async ({ x, y }: Coordinates, color: Color) => {
    const { x: left, y: top } = this._gridToPixel({ x, y });
    const paletteSwaps = PaletteSwaps.builder()
      .addMapping(Colors.BLACK, color)
      .build();
    const image = await this.imageFactory.getImage({
      filename: SHADOW_FILENAME,
      transparentColor: Colors.WHITE,
      paletteSwaps
    });
    this.context.drawImage(image.bitmap, left, top);
  };

  private _isTileRevealed = ({ x, y }: Coordinates): boolean => {
    const map = this.state.getMap();
    // @ts-ignore
    return window.jwb.debug.isMapRevealed() || map.isTileRevealed({ x, y });
  };
}

export default GameScreenRenderer;
