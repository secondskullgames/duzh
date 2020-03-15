import { isTileRevealed } from '../maps/MapUtils';
import { Coordinates, Entity, ItemCategory, Rect, Tile } from '../types/types';
import { revealTiles } from '../core/actions';
import Sprite from './sprites/Sprite';
import { chainPromises, resolvedPromise } from '../utils/PromiseUtils';
import Colors from '../types/Colors';
import Renderer from './Renderer';

const TILE_WIDTH = 32;
const TILE_HEIGHT = 24;

const WIDTH = 20; // in tiles
const HEIGHT = 15; // in tiles

const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 360;

const BOTTOM_PANEL_HEIGHT = 4 * TILE_HEIGHT;
const BOTTOM_PANEL_WIDTH = 6 * TILE_WIDTH;
const BOTTOM_BAR_WIDTH = 8 * TILE_WIDTH;
const BOTTOM_BAR_HEIGHT = 2 * TILE_HEIGHT;

const INVENTORY_LEFT = 2 * TILE_WIDTH;
const INVENTORY_TOP = 2 * TILE_HEIGHT;
const INVENTORY_WIDTH = 16 * TILE_WIDTH;
const INVENTORY_HEIGHT = 12 * TILE_HEIGHT;

const LINE_HEIGHT = 16;

class SpriteRenderer implements Renderer {
  private readonly _container: HTMLElement;
  private readonly _canvas: HTMLCanvasElement;
  private readonly _context: CanvasRenderingContext2D;

  constructor() {
    this._container = <any>document.getElementById('container');
    this._container.innerHTML = '';
    this._canvas = document.createElement('canvas');
    this._canvas.width = WIDTH * TILE_WIDTH;
    this._canvas.height = HEIGHT * TILE_HEIGHT;
    this._container.appendChild(this._canvas);
    this._context = <any>this._canvas.getContext('2d');
    this._context.imageSmoothingEnabled = false;
    this._context.textBaseline = 'middle';
  }

  render(): Promise<any> {
    const { screen } = jwb.state;
    switch (screen) {
      case 'GAME':
        return this._renderGameScreen();
      case 'INVENTORY':
        return this._renderGameScreen()
          .then(() => this._renderInventory());
      default:
        throw `Invalid screen ${screen}`;
    }
  }

  private _renderGameScreen(): Promise<any> {
    revealTiles();
    this._context.fillStyle = Colors.BLACK;
    this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);

    return chainPromises([
      () => this._renderTiles(),
      () => this._renderItems(),
      () => this._renderUnits(),
      () => Promise.all([this._renderPlayerInfo(), this._renderBottomBar(), this._renderMessages()])
    ]);
  }

  private _renderTiles(): Promise<any> {
    const promises: Promise<any>[] = [];
    const map = jwb.state.getMap();
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
  }

  private _renderItems(): Promise<any> {
    const map = jwb.state.getMap();
    const promises: Promise<any>[] = [];
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (isTileRevealed({ x, y })) {
          const item = map.getItem({ x, y });
          if (!!item) {
            promises.push(this._drawEllipse({ x, y }, Colors.DARK_GRAY, TILE_WIDTH * 3 / 8, TILE_HEIGHT * 3 / 8));
            promises.push(this._renderElement(item, { x, y }));
          }
        }
      }
    }
    return Promise.all(promises);
  }

  private _renderUnits(): Promise<any> {
    const { playerUnit } = jwb.state;
    const map = jwb.state.getMap();

    const promises: Promise<any>[] = [];
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (isTileRevealed({ x, y })) {
          const unit = map.getUnit({ x, y });
          if (!!unit) {
            if (unit === playerUnit) {
              promises.push(this._drawEllipse({ x, y }, Colors.GREEN, TILE_WIDTH * 3 / 8, TILE_HEIGHT * 3 / 8));
            } else {
              promises.push(this._drawEllipse({ x, y }, Colors.DARK_GRAY, TILE_WIDTH * 3 / 8, TILE_HEIGHT * 3 / 8));
            }
            promises.push(this._renderElement(unit, { x, y }));
          }
        }
      }
    }
    return Promise.all(promises);
  }

  /**
   * @param color (in hex form)
   */
  private _drawEllipse({ x, y }: Coordinates, color: Colors, width: number, height: number): Promise<any> {
    const { _context } = this;
    _context.fillStyle = color;
    const topLeftPixel = this._gridToPixel({ x, y });
    const [cx, cy] = [topLeftPixel.x + TILE_WIDTH / 2, topLeftPixel.y + TILE_HEIGHT / 2];
    _context.moveTo(cx, cy);
    _context.beginPath();
    _context.ellipse(cx, cy, width, height, 0, 0, 2 * Math.PI);
    _context.fill();
    return new Promise(resolve => { resolve(); });
  }

  private _renderInventory(): Promise<any> {
    const { playerUnit } = jwb.state;
    const { inventory } = playerUnit;
    const { _canvas, _context } = this;

    this._drawRect({ left: INVENTORY_LEFT, top: INVENTORY_TOP, width: INVENTORY_WIDTH, height: INVENTORY_HEIGHT });

    // draw equipment

    const equipmentLeft = INVENTORY_LEFT + TILE_WIDTH;
    const inventoryLeft = (_canvas.width + TILE_WIDTH) / 2;

    // draw titles
    _context.fillStyle = Colors.WHITE;
    _context.textAlign = 'center';
    _context.font = '20px Monospace';
    _context.fillText('EQUIPMENT', _canvas.width / 4, INVENTORY_TOP + 12);
    _context.fillText('INVENTORY', _canvas.width * 3 / 4, INVENTORY_TOP + 12);

    // draw equipment items
    // for now, just display them all in one list

    _context.font = '10px sans-serif';
    _context.textAlign = 'left';

    let y = INVENTORY_TOP + 64;
    playerUnit.equipment.getEntries().forEach(([slot, equipment]) => {
      _context.fillText(`${slot} - ${equipment.name}`, equipmentLeft, y);
      y += LINE_HEIGHT;
    });

    // draw inventory categories
    const inventoryCategories: ItemCategory[] = Object.values(ItemCategory);
    const categoryWidth = 60;
    const xOffset = 4;

    _context.font = '14px Monospace';
    _context.textAlign = 'center';

    for (let i = 0; i < inventoryCategories.length; i++) {
      const x = inventoryLeft + i * categoryWidth + (categoryWidth / 2) + xOffset;
      _context.fillText(inventoryCategories[i], x, INVENTORY_TOP + 40);
      if (inventoryCategories[i] === inventory.selectedCategory) {
        _context.fillRect(x - (categoryWidth / 2) + 4, INVENTORY_TOP + 48, categoryWidth - 8, 1);
      }
    }

    // draw inventory items

    if (inventory.selectedCategory) {
      const items = inventory.get(inventory.selectedCategory);
      const x = inventoryLeft + 8;

      _context.font = '10px sans-serif';
      _context.textAlign = 'left';

      for (let i = 0; i < items.length; i++) {
        const y = INVENTORY_TOP + 64 + LINE_HEIGHT * i;
        if (items[i] === inventory.selectedItem) {
          _context.fillStyle = Colors.YELLOW;
        } else {
          _context.fillStyle = Colors.WHITE;
        }
        _context.fillText(items[i].name, x, y);
      }
      _context.fillStyle = Colors.WHITE;
    }

    return resolvedPromise();
  }

  private _isPixelOnScreen({ x, y }: Coordinates): boolean {
    return (
      (x >= -TILE_WIDTH) &&
      (x <= SCREEN_WIDTH + TILE_WIDTH) &&
      (y >= -TILE_HEIGHT) &&
      (y <= SCREEN_HEIGHT + TILE_HEIGHT)
    );
  }

  private _renderElement(element: (Entity | Tile), { x, y }: Coordinates): Promise<any> {
    const pixel: Coordinates = this._gridToPixel({ x, y });

    if (this._isPixelOnScreen(pixel)) {
      const { sprite } = element;
      if (!!sprite) {
        return this._drawSprite(sprite, pixel);
      }
    }
    return resolvedPromise();
  }

  private _drawSprite(sprite: Sprite, { x, y }: Coordinates): Promise<any> {
    return sprite.getImage()
      .then(image => this._context.drawImage(image, x + sprite.dx, y + sprite.dy));
  }

  /**
   * Renders the bottom-left area of the screen, showing information about the player
   */
  private _renderPlayerInfo(): Promise<void> {
    const { _context } = this;
    return new Promise(resolve => {
      const { playerUnit } = jwb.state;

      const top = SCREEN_HEIGHT - BOTTOM_PANEL_HEIGHT;
      this._drawRect({ left: 0, top, width: BOTTOM_PANEL_WIDTH, height: BOTTOM_PANEL_HEIGHT });

      const lines = [
        playerUnit.name,
        `Level ${playerUnit.level}`,
        `Life: ${playerUnit.life}/${playerUnit.maxLife}`,
        `Damage: ${playerUnit.getDamage()}`,
      ];
      const experienceToNextLevel = playerUnit.experienceToNextLevel();
      if (experienceToNextLevel !== null) {
        lines.push(`Experience: ${playerUnit.experience}/${experienceToNextLevel}`);
      }
      _context.fillStyle = '#fff';
      _context.textAlign = 'left';
      _context.font = '10px sans-serif';

      const left = 4;
      for (let i = 0; i < lines.length; i++) {
        let y = top + (LINE_HEIGHT / 2) + (LINE_HEIGHT * i);
        _context.fillText(lines[i], left, y);
      }
      resolve();
    });
  }

  private _renderMessages(): Promise<void> {
    const { _context } = this;
    return new Promise(resolve => {
      const { messages } = jwb.state;
      _context.fillStyle = Colors.BLACK;
      _context.strokeStyle = Colors.WHITE;

      const left = SCREEN_WIDTH - BOTTOM_PANEL_WIDTH;
      const top = SCREEN_HEIGHT - BOTTOM_PANEL_HEIGHT;
      this._drawRect({ left, top, width: BOTTOM_PANEL_WIDTH, height: BOTTOM_PANEL_HEIGHT });

      _context.fillStyle = Colors.WHITE;
      _context.textAlign = 'left';
      _context.font = '10px sans-serif';

      const textLeft = left + 4;

      for (let i = 0; i < messages.length; i++) {
        let y = top + (LINE_HEIGHT / 2) + (LINE_HEIGHT * i);
        _context.fillText(messages[i], textLeft, y);
      }
      resolve();
    });
  }

  private _renderBottomBar(): Promise<void> {
    const { _context } = this;

    const left = BOTTOM_PANEL_WIDTH;
    const top = SCREEN_HEIGHT - BOTTOM_BAR_HEIGHT;
    const width = SCREEN_WIDTH - 2 * BOTTOM_PANEL_WIDTH;

    this._drawRect({ left, top, width, height: BOTTOM_BAR_HEIGHT });

    const { mapIndex, turn } = jwb.state;
    _context.textAlign = 'left';
    _context.fillStyle = Colors.WHITE;
    const textLeft = left + 4;
    _context.fillText(`Level: ${(mapIndex || 0) + 1}`, textLeft, top + 8);
    _context.fillText(`Turn: ${turn}`, textLeft, top + 8 + LINE_HEIGHT);

    return resolvedPromise();
  }

  private _drawRect({ left, top, width, height }: Rect) {
    const { _context } = this;

    _context.fillStyle = Colors.BLACK;
    _context.fillRect(left, top, width, height);
    _context.strokeStyle = Colors.WHITE;
    _context.strokeRect(left, top, width, height);
  }

  /**
   * @return the top left pixel
   */
  private _gridToPixel({ x, y }: Coordinates): Coordinates {
    const { playerUnit } = jwb.state;
    return {
      x: ((x - playerUnit.x) * TILE_WIDTH) + (SCREEN_WIDTH - TILE_WIDTH) / 2,
      y: ((y - playerUnit.y) * TILE_HEIGHT) + (SCREEN_HEIGHT - TILE_HEIGHT) / 2
    };
  }
}

export default SpriteRenderer;
