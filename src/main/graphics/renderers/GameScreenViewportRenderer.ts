import { Renderer } from './Renderer';
import Equipment from '../../equipment/Equipment';
import Unit from '../../units/Unit';
import Colors from '../Colors';
import { TILE_HEIGHT, TILE_WIDTH } from '../constants';
import Sprite from '../sprites/Sprite';
import { PaletteSwaps } from '@lib/graphics/PaletteSwaps';
import { Coordinates } from '@lib/geometry/Coordinates';
import { Pixel } from '@lib/geometry/Pixel';
import { Graphics } from '@lib/graphics/Graphics';
import Entity from '@main/entities/Entity';
import { Debug } from '@main/core/Debug';
import { GameConfig } from '@main/core/GameConfig';
import ImageFactory from '@lib/graphics/images/ImageFactory';
import { Color } from '@lib/graphics/Color';
import { getItem, getMovableBlock } from '@main/maps/MapUtils';
import { ShrineMenuRenderer } from '@main/graphics/renderers/ShrineMenuRenderer';
import { Engine } from '@main/core/Engine';
import { inject, injectable } from 'inversify';

const SHADOW_FILENAME = 'shadow';

@injectable()
export default class GameScreenViewportRenderer implements Renderer {
  constructor(
    @inject(GameConfig)
    private readonly gameConfig: GameConfig,
    @inject(Engine)
    private readonly engine: Engine,
    @inject(ImageFactory)
    private readonly imageFactory: ImageFactory,
    @inject(ShrineMenuRenderer)
    private readonly shrineMenuRenderer: ShrineMenuRenderer,
    @inject(Debug)
    private readonly debug: Debug
  ) {}

  render = async (graphics: Graphics) => {
    const { engine } = this;
    const session = engine.getSession();
    graphics.fill(Colors.BLACK);

    this._renderTiles(graphics);
    await this._renderEntities(graphics);

    // TODO: consider a generic menu system
    if (session.isShowingShrineMenu()) {
      await this._renderShrineMenu(graphics);
    }
  };

  private _renderElement = (
    element: Entity | Equipment,
    coordinates: Coordinates,
    graphics: Graphics
  ) => {
    const pixel = this._gridToPixel(coordinates);

    if (this._isPixelOnScreen(pixel)) {
      const sprite = element.getSprite();
      if (sprite) {
        this._drawSprite(sprite, pixel, graphics);
      }
    }
  };

  private _drawSprite = (sprite: Sprite, pixel: Pixel, graphics: Graphics) => {
    const image = sprite.getImage();
    if (image) {
      const { dx, dy } = sprite.getOffsets();
      graphics.drawImage(image, { x: pixel.x + dx, y: pixel.y + dy });
    }
  };

  /**
   * @return the top left pixel
   */
  private _gridToPixel = ({ x, y }: Coordinates): Pixel => {
    const { engine } = this;
    const session = engine.getSession();
    const playerUnit = session.getPlayerUnit();
    const { x: playerX, y: playerY } = playerUnit.getCoordinates();
    return {
      x: (x - playerX) * TILE_WIDTH + (this.gameConfig.screenWidth - TILE_WIDTH) / 2,
      y: (y - playerY) * TILE_HEIGHT + (this.gameConfig.screenHeight - TILE_HEIGHT) / 2
    };
  };

  private _renderTiles = (graphics: Graphics) => {
    const { engine } = this;
    const session = engine.getSession();
    const map = session.getMap();

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const coordinates = { x, y };
        if (this._isTileRevealed(coordinates)) {
          const tile = map.getTile(coordinates);
          if (tile) {
            this._renderElement(tile, coordinates, graphics);
          }
        }
      }
    }
  };

  /**
   * Render all entities, one row at a time.
   */
  private _renderEntities = async (graphics: Graphics) => {
    const { engine } = this;
    const session = engine.getSession();
    const map = session.getMap();

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const coordinates = { x, y };
        if (this._isTileRevealed(coordinates)) {
          await this._drawShadow(coordinates, graphics);
          for (const object of map.getObjects(coordinates)) {
            this._renderElement(object, coordinates, graphics);
          }

          const projectile = map.getProjectile(coordinates);
          if (projectile) {
            this._renderElement(projectile, coordinates, graphics);
          }

          const unit = map.getUnit(coordinates);
          if (unit) {
            this._renderUnit(unit, coordinates, graphics);
          }
        }
      }
    }
  };

  /**
   * Render the unit, all of its equipment, and the corresponding overlay.
   */
  private _renderUnit = (unit: Unit, coordinates: Coordinates, graphics: Graphics) => {
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
      this._renderElement(equipment, coordinates, graphics);
    }
    this._renderElement(unit, coordinates, graphics);
    for (const equipment of aheadEquipment) {
      this._renderElement(equipment, coordinates, graphics);
    }
  };

  private _isTileRevealed = (coordinates: Coordinates): boolean => {
    const { engine } = this;
    const session = engine.getSession();
    const map = session.getMap();
    return this.debug.isMapRevealed() || map.isTileRevealed(coordinates);
  };

  private _drawShadow = async (coordinates: Coordinates, graphics: Graphics) => {
    const { engine } = this;
    const session = engine.getSession();
    const map = session.getMap();
    const unit = map.getUnit(coordinates);

    if (unit) {
      if (unit === session.getPlayerUnit()) {
        return this._drawEllipse(coordinates, Colors.GREEN, graphics);
      } else {
        return this._drawEllipse(coordinates, Colors.DARK_GRAY, graphics);
      }
    }

    if (getItem(map, coordinates) || getMovableBlock(map, coordinates)) {
      return this._drawEllipse(coordinates, Colors.DARK_GRAY, graphics);
    }
  };

  private _drawEllipse = async (
    coordinates: Coordinates,
    color: Color,
    graphics: Graphics
  ) => {
    const pixel = this._gridToPixel(coordinates);
    const paletteSwaps = PaletteSwaps.builder().addMapping(Colors.BLACK, color).build();
    const image = await this.imageFactory.getImage({
      filename: SHADOW_FILENAME,
      transparentColor: Colors.WHITE,
      paletteSwaps
    });
    graphics.drawImage(image, pixel);
  };

  /**
   * Allow for a one-tile buffer in each direction
   */
  private _isPixelOnScreen = ({ x, y }: Pixel): boolean =>
    x >= -TILE_WIDTH &&
    x <= this.gameConfig.screenWidth + TILE_WIDTH &&
    y >= -TILE_HEIGHT &&
    y <= this.gameConfig.screenHeight + TILE_HEIGHT;

  private _renderShrineMenu = async (graphics: Graphics) => {
    await this.shrineMenuRenderer.render(graphics);
  };
}
