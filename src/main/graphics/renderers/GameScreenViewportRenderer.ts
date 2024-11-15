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
import { ImageFactory } from '@lib/graphics/images/ImageFactory';
import { Color } from '@lib/graphics/Color';
import { getItem, getMovableBlock } from '@main/maps/MapUtils';
import { ShrineMenuRenderer } from '@main/graphics/renderers/ShrineMenuRenderer';
import { Game } from '@main/core/Game';
import { inject, injectable } from 'inversify';
import MapInstance from '@main/maps/MapInstance';

const SHADOW_FILENAME = 'shadow';

export default class GameScreenViewportRenderer implements Renderer {
  constructor(private readonly shrineMenuRenderer: ShrineMenuRenderer) {}

  render = async (game: Game, graphics: Graphics) => {
    const { state } = game;
    const map = state.getPlayerUnit().getMap();
    graphics.fill(Colors.BLACK);

    this._renderTiles(map, game, graphics);
    await this._renderEntities(map, game, graphics);

    // TODO: consider a generic menu system
    if (state.isShowingShrineMenu()) {
      await this._renderShrineMenu(game, graphics);
    }
  };

  private _renderElement = (
    element: Entity | Equipment,
    coordinates: Coordinates,
    game: Game,
    graphics: Graphics
  ) => {
    const pixel = this._gridToPixel(coordinates, game);

    if (this._isPixelOnScreen(pixel, game)) {
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
  private _gridToPixel = ({ x, y }: Coordinates, game: Game): Pixel => {
    const { state, config } = game;
    const playerUnit = state.getPlayerUnit();
    const { x: playerX, y: playerY } = playerUnit.getCoordinates();
    return {
      x: (x - playerX) * TILE_WIDTH + (config.screenWidth - TILE_WIDTH) / 2,
      y: (y - playerY) * TILE_HEIGHT + (config.screenHeight - TILE_HEIGHT) / 2
    };
  };

  private _renderTiles = (map: MapInstance, game: Game, graphics: Graphics) => {
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const coordinates = { x, y };
        if (this._isTileRevealed(coordinates, map)) {
          const tile = map.getTile(coordinates);
          if (tile) {
            this._renderElement(tile, coordinates, game, graphics);
          }
        }
      }
    }
  };

  /**
   * Render all entities, one row at a time.
   */
  private _renderEntities = async (map: MapInstance, game: Game, graphics: Graphics) => {
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const coordinates = { x, y };
        if (this._isTileRevealed(coordinates, map)) {
          await this._drawShadow(coordinates, map, game, graphics);
          for (const object of map.getObjects(coordinates)) {
            this._renderElement(object, coordinates, game, graphics);
          }

          const projectile = map.getProjectile(coordinates);
          if (projectile) {
            this._renderElement(projectile, coordinates, game, graphics);
          }

          const unit = map.getUnit(coordinates);
          if (unit) {
            this._renderUnit(unit, coordinates, game, graphics);
          }
        }
      }
    }
  };

  /**
   * Render the unit, all of its equipment, and the corresponding overlay.
   */
  private _renderUnit = (
    unit: Unit,
    coordinates: Coordinates,
    game: Game,
    graphics: Graphics
  ) => {
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
      this._renderElement(equipment, coordinates, game, graphics);
    }
    this._renderElement(unit, coordinates, game, graphics);
    for (const equipment of aheadEquipment) {
      this._renderElement(equipment, coordinates, game, graphics);
    }
  };

  private _isTileRevealed = (coordinates: Coordinates, map: MapInstance): boolean => {
    return map.isTileRevealed(coordinates);
  };

  private _drawShadow = async (
    coordinates: Coordinates,
    map: MapInstance,
    game: Game,
    graphics: Graphics
  ) => {
    const { state } = game;
    const unit = map.getUnit(coordinates);

    if (unit) {
      if (unit === state.getPlayerUnit()) {
        return this._drawEllipse(coordinates, Colors.GREEN, game, graphics);
      } else {
        return this._drawEllipse(coordinates, Colors.DARK_GRAY, game, graphics);
      }
    }

    if (getItem(map, coordinates) || getMovableBlock(map, coordinates)) {
      return this._drawEllipse(coordinates, Colors.DARK_GRAY, game, graphics);
    }
  };

  private _drawEllipse = async (
    coordinates: Coordinates,
    color: Color,
    game: Game,
    graphics: Graphics
  ) => {
    const pixel = this._gridToPixel(coordinates, game);
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
  private _isPixelOnScreen = ({ x, y }: Pixel, game: Game): boolean =>
    x >= -TILE_WIDTH &&
    x <= game.config.screenWidth + TILE_WIDTH &&
    y >= -TILE_HEIGHT &&
    y <= game.config.screenHeight + TILE_HEIGHT;

  private _renderShrineMenu = async (game: Game, graphics: Graphics) => {
    await this.shrineMenuRenderer.render(game, graphics);
  };
}
