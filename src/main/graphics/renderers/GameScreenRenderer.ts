import Equipment from '../../equipment/Equipment';
import Coordinates from '../../geometry/Coordinates';
import Unit from '../../entities/units/Unit';
import Color from '../Color';
import Colors from '../Colors';
import { SCREEN_HEIGHT, SCREEN_WIDTH, TILE_HEIGHT, TILE_WIDTH } from '../constants';
import PaletteSwaps from '../PaletteSwaps';
import Sprite from '../sprites/Sprite';
import { Pixel } from '../Pixel';
import { RenderContext, Renderer } from './Renderer';
import { Graphics } from '../Graphics';
import { checkNotNull } from '../../utils/preconditions';
import ImageFactory from '../images/ImageFactory';

const SHADOW_FILENAME = 'shadow';

type Element = Readonly<{
  getSprite: () => Sprite | null;
}>;

type Props = Readonly<{
  graphics: Graphics,
  imageFactory: ImageFactory
}>;

export default class GameScreenRenderer implements Renderer {
  private readonly graphics: Graphics;
  private readonly imageFactory: ImageFactory;

  constructor({ graphics, imageFactory }: Props) {
    this.graphics = graphics;
    this.imageFactory = imageFactory;
  }

  render = async (context: RenderContext) => {
    this.graphics.fill(Colors.BLACK);

    this._renderTiles(context);
    await this._renderEntities(context);
  };

  private _renderElement = (element: Element, coordinates: Coordinates, context: RenderContext) => {
    const pixel = this._gridToPixel(coordinates, context);

    if (_isPixelOnScreen(pixel)) {
      const sprite = element.getSprite();
      if (sprite) {
        this._drawSprite(sprite, pixel, context);
      }
    }
  };

  private _drawSprite = (sprite: Sprite, pixel: Pixel, context: RenderContext) => {
    const image = sprite.getImage();
    if (image) {
      const { dx, dy } = sprite.getOffsets();
      this.graphics.drawImage(image, { x: pixel.x + dx, y: pixel.y + dy });
    }
  };

  /**
   * @return the top left pixel
   */
  private _gridToPixel = ({ x, y }: Coordinates, { state }: RenderContext): Pixel => {
    const playerUnit = state.getPlayerUnit();
    const { x: playerX, y: playerY } = playerUnit.getCoordinates();
    return {
      x: ((x - playerX) * TILE_WIDTH) + (SCREEN_WIDTH - TILE_WIDTH) / 2,
      y: ((y - playerY) * TILE_HEIGHT) + (SCREEN_HEIGHT - TILE_HEIGHT) / 2
    };
  };

  private _renderTiles = (context: RenderContext) => {
    const { state } = context;
    const map = checkNotNull(state.getMap());

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const coordinates = { x, y };
        if (this._isTileRevealed(coordinates, context)) {
          const tile = map.getTile(coordinates);
          if (tile) {
            this._renderElement(tile, coordinates, context);
          }
        }
      }
    }
  };

  /**
   * Render all entities, one row at a time.
   */
  private _renderEntities = async (context: RenderContext) => {
    const { state } = context;
    const map = checkNotNull(state.getMap());

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const coordinates = { x, y };
        if (this._isTileRevealed(coordinates, context)) {
          await this._drawShadow(coordinates, context);
          for (const object of map.getObjects(coordinates)) {
            this._renderElement(object, coordinates, context);
          }

          const projectile = map.getProjectile(coordinates);
          if (projectile) {
            this._renderElement(projectile, coordinates, context);
          }

          const unit = map.getUnit(coordinates);
          if (unit) {
            this._renderUnit(unit, coordinates, context);
          }
        }
      }
    }
  };

  /**
   * Render the unit, all of its equipment, and the ceorresponding overlay.
   */
  private _renderUnit = (unit: Unit, coordinates: Coordinates, context: RenderContext) => {
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
      this._renderElement(equipment, coordinates, context);
    }
    this._renderElement(unit, coordinates, context);
    for (const equipment of aheadEquipment) {
      this._renderElement(equipment, coordinates, context);
    }
  };

  private _isTileRevealed = (coordinates: Coordinates, context: RenderContext): boolean => {
    const { state } = context;
    const map = checkNotNull(state.getMap());
    // @ts-ignore
    return window.jwb?.debug?.isMapRevealed() || map.isTileRevealed(coordinates);
  };

  private _drawShadow = async (coordinates: Coordinates, context: RenderContext) => {
    const { state } = context;
    const map = checkNotNull(state.getMap());
    const unit = map.getUnit(coordinates);
    const objects = map.getObjects(coordinates);

    if (unit) {
      if (unit === state.getPlayerUnit()) {
        return this._drawEllipse(coordinates, Colors.GREEN, context);
      } else {
        return this._drawEllipse(coordinates, Colors.DARK_GRAY, context);
      }
    }
    if (objects.find(object =>
      object.getObjectType() === 'item'
      || object.getObjectType() === 'block'
    )) {
      return this._drawEllipse(coordinates, Colors.DARK_GRAY, context);
    }
  }

  private _drawEllipse = async (coordinates: Coordinates, color: Color, context: RenderContext) => {
    const { imageFactory } = this;
    const pixel = this._gridToPixel(coordinates, context);
    const paletteSwaps = PaletteSwaps.builder()
      .addMapping(Colors.BLACK, color)
      .build();
    const image = await imageFactory.getImage({
      filename: SHADOW_FILENAME,
      transparentColor: Colors.WHITE,
      paletteSwaps
    });
    this.graphics.drawImage(image, pixel);
  };
}

/**
 * Allow for a one-tile buffer in each direction
 */
const _isPixelOnScreen = ({ x, y }: Pixel): boolean =>
  (x >= -TILE_WIDTH) &&
  (x <= SCREEN_WIDTH + TILE_WIDTH) &&
  (y >= -TILE_HEIGHT) &&
  (y <= SCREEN_HEIGHT + TILE_HEIGHT);
