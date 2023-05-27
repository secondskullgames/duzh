import GameState from '../../core/GameState';
import Equipment from '../../equipment/Equipment';
import Coordinates from '../../geometry/Coordinates';
import Unit from '../../entities/units/Unit';
import Color from '../Color';
import Colors from '../Colors';
import { SCREEN_HEIGHT, SCREEN_WIDTH, TILE_HEIGHT, TILE_WIDTH } from '../constants';
import ImageFactory from '../images/ImageFactory';
import PaletteSwaps from '../PaletteSwaps';
import Sprite from '../sprites/Sprite';
import AbstractRenderer from './AbstractRenderer';
import { Pixel } from '../Pixel';
import Entity from '../../entities/Entity';

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

  protected _redraw = async () => {
    const { canvas, context } = this;
    context.fillStyle = Colors.BLACK.hex;
    context.fillRect(0, 0, canvas.width, canvas.height);

    await this._renderTiles();
    await this._renderEntities();
  };

  private _renderElement = (element: Element, coordinates: Coordinates) => {
    const pixel = this._gridToPixel(coordinates);

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
        const coordinates = { x, y };
        if (this._isTileRevealed(coordinates)) {
          await this._drawShadow(coordinates);
          for (const object of map.getObjects(coordinates)) {
            this._renderElement(object, coordinates);
          }

          const projectile = map.getProjectile(coordinates);
          if (projectile) {
            this._renderElement(projectile, coordinates);
          }

          const unit = map.getUnit(coordinates);
          if (unit) {
            this._renderUnit(unit, coordinates);
          }
        }
      }
    }
  };

  /**
   * Render the unit, all of its equipment, and the ceorresponding overlay.
   */
  private _renderUnit = (unit: Unit, coordinates: Coordinates) => {
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

    for (const equipment of behindEquipment) {
      this._renderElement(equipment, coordinates);
    }
    this._renderElement(unit, coordinates);
    for (const equipment of aheadEquipment) {
      this._renderElement(equipment, coordinates);
    }
  };

  private _isTileRevealed = (coordinates: Coordinates): boolean => {
    const map = this.state.getMap();
    // @ts-ignore
    return window.jwb.debug.isMapRevealed() || map.isTileRevealed(coordinates);
  };

  private _drawShadow = async (coordinates: Coordinates) => {
    const map = this.state.getMap();
    const unit = map.getUnit(coordinates);
    const objects = map.getObjects(coordinates);

    if (unit) {
      if (unit === this.state.getPlayerUnit()) {
        return this._drawEllipse(coordinates, Colors.GREEN);
      } else {
        return this._drawEllipse(coordinates, Colors.DARK_GRAY);
      }
    }
    if (objects.find(object =>
      object.getObjectType() === 'item'
      || object.getObjectType() === 'block'
    )) {
      return this._drawEllipse(coordinates, Colors.DARK_GRAY);
    }
  }

  private _drawEllipse = async (coordinates: Coordinates, color: Color) => {
    const pixel = this._gridToPixel(coordinates);
    const paletteSwaps = PaletteSwaps.builder()
      .addMapping(Colors.BLACK, color)
      .build();
    const image = await this.imageFactory.getImage({
      filename: SHADOW_FILENAME,
      transparentColor: Colors.WHITE,
      paletteSwaps
    });
    this.context.drawImage(image.bitmap, pixel.x, pixel.y);
  };
}

export default GameScreenRenderer;
