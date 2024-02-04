import { Renderer } from './Renderer';
import Equipment from '../../equipment/Equipment';
import Coordinates from '../../geometry/Coordinates';
import Unit from '../../entities/units/Unit';
import Color from '../Color';
import Colors from '../Colors';
import { SCREEN_HEIGHT, SCREEN_WIDTH, TILE_HEIGHT, TILE_WIDTH } from '../constants';
import PaletteSwaps from '../PaletteSwaps';
import Sprite from '../sprites/Sprite';
import { Pixel } from '../Pixel';
import { Graphics } from '../Graphics';
import { checkNotNull } from '../../utils/preconditions';
import { Session } from '../../core/Session';
import ImageFactory from '../images/ImageFactory';

const SHADOW_FILENAME = 'shadow';

type Element = Readonly<{
  getSprite: () => Sprite | null;
}>;

type Props = Readonly<{
  graphics: Graphics;
  imageFactory: ImageFactory;
}>;

export default class GameScreenRenderer implements Renderer {
  private readonly graphics: Graphics;
  private readonly imageFactory: ImageFactory;

  constructor({ graphics, imageFactory }: Props) {
    this.graphics = graphics;
    this.imageFactory = imageFactory;
  }

  render = async (session: Session) => {
    this.graphics.fill(Colors.BLACK);

    this._renderTiles(session);
    await this._renderEntities(session);
  };

  private _renderElement = (
    element: Element,
    coordinates: Coordinates,
    session: Session
  ) => {
    const pixel = this._gridToPixel(coordinates, session);

    if (_isPixelOnScreen(pixel)) {
      const sprite = element.getSprite();
      if (sprite) {
        this._drawSprite(sprite, pixel);
      }
    }
  };

  private _drawSprite = (sprite: Sprite, pixel: Pixel) => {
    const image = sprite.getImage();
    if (image) {
      const { dx, dy } = sprite.getOffsets();
      this.graphics.drawImage(image, { x: pixel.x + dx, y: pixel.y + dy });
    }
  };

  /**
   * @return the top left pixel
   */
  private _gridToPixel = ({ x, y }: Coordinates, session: Session): Pixel => {
    const playerUnit = session.getPlayerUnit();
    const { x: playerX, y: playerY } = playerUnit.getCoordinates();
    return {
      x: (x - playerX) * TILE_WIDTH + (SCREEN_WIDTH - TILE_WIDTH) / 2,
      y: (y - playerY) * TILE_HEIGHT + (SCREEN_HEIGHT - TILE_HEIGHT) / 2
    };
  };

  private _renderTiles = (session: Session) => {
    const map = checkNotNull(session.getMap());

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const coordinates = { x, y };
        if (this._isTileRevealed(coordinates, session)) {
          const tile = map.getTile(coordinates);
          if (tile) {
            this._renderElement(tile, coordinates, session);
          }
        }
      }
    }
  };

  /**
   * Render all entities, one row at a time.
   */
  private _renderEntities = async (session: Session) => {
    const map = checkNotNull(session.getMap());

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const coordinates = { x, y };
        if (this._isTileRevealed(coordinates, session)) {
          await this._drawShadow(coordinates, session);
          for (const object of map.getObjects(coordinates)) {
            this._renderElement(object, coordinates, session);
          }

          const projectile = map.getProjectile(coordinates);
          if (projectile) {
            this._renderElement(projectile, coordinates, session);
          }

          const unit = map.getUnit(coordinates);
          if (unit) {
            this._renderUnit(unit, coordinates, session);
          }
        }
      }
    }
  };

  /**
   * Render the unit, all of its equipment, and the ceorresponding overlay.
   */
  private _renderUnit = (unit: Unit, coordinates: Coordinates, session: Session) => {
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
      this._renderElement(equipment, coordinates, session);
    }
    this._renderElement(unit, coordinates, session);
    for (const equipment of aheadEquipment) {
      this._renderElement(equipment, coordinates, session);
    }
  };

  private _isTileRevealed = (coordinates: Coordinates, session: Session): boolean => {
    const map = checkNotNull(session.getMap());
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return window.jwb?.debug?.isMapRevealed() || map.isTileRevealed(coordinates);
  };

  private _drawShadow = async (coordinates: Coordinates, session: Session) => {
    const map = checkNotNull(session.getMap());
    const unit = map.getUnit(coordinates);
    const objects = map.getObjects(coordinates);

    if (unit) {
      if (unit === session.getPlayerUnit()) {
        return this._drawEllipse(coordinates, Colors.GREEN, session);
      } else {
        return this._drawEllipse(coordinates, Colors.DARK_GRAY, session);
      }
    }
    if (
      objects.find(
        object => object.getObjectType() === 'item' || object.getObjectType() === 'block'
      )
    ) {
      return this._drawEllipse(coordinates, Colors.DARK_GRAY, session);
    }
  };

  private _drawEllipse = async (
    coordinates: Coordinates,
    color: Color,
    session: Session
  ) => {
    const pixel = this._gridToPixel(coordinates, session);
    const paletteSwaps = PaletteSwaps.builder().addMapping(Colors.BLACK, color).build();
    const image = await this.imageFactory.getImage({
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
  x >= -TILE_WIDTH &&
  x <= SCREEN_WIDTH + TILE_WIDTH &&
  y >= -TILE_HEIGHT &&
  y <= SCREEN_HEIGHT + TILE_HEIGHT;
