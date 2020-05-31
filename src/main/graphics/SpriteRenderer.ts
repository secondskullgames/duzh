import Sprite from './sprites/Sprite';
import Colors from '../types/Colors';
import Renderer from './Renderer';
import { chainPromises, resolvedPromise } from '../utils/PromiseUtils';
import { coordinatesEquals, isTileRevealed } from '../maps/MapUtils';
import { Coordinates, Entity, GameScreen, ItemCategory, Rect, Tile } from '../types/types';
import { revealTiles } from '../core/actions';
import { applyTransparentColor, loadImage, replaceColors } from './ImageUtils';
import FontRenderer, { FontDefinition, Fonts } from './FontRenderer';
import MinimapRenderer from './MinimapRenderer';

const TILE_WIDTH = 32;
const TILE_HEIGHT = 24;

const WIDTH = 20; // in tiles
const HEIGHT = 15; // in tiles

const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 360;

const HUD_HEIGHT = 3 * TILE_HEIGHT;
const HUD_LEFT_WIDTH = 5 * TILE_WIDTH;
const HUD_RIGHT_WIDTH = 5 * TILE_WIDTH;
const HUD_MARGIN = 5;

const INVENTORY_LEFT = 2 * TILE_WIDTH;
const INVENTORY_TOP = 2 * TILE_HEIGHT;
const INVENTORY_WIDTH = 16 * TILE_WIDTH;
const INVENTORY_HEIGHT = 11 * TILE_HEIGHT;
const INVENTORY_MARGIN = 12;

const LINE_HEIGHT = 16;

const GAME_OVER_FILENAME = 'gameover';
const TITLE_FILENAME = 'title';
const VICTORY_FILENAME = 'victory';
const HUD_FILENAME = 'HUD';
const INVENTORY_BACKGROUND_FILENAME = 'inventory_background';
const SHADOW_FILENAME = 'shadow';

class SpriteRenderer implements Renderer {
  static SCREEN_WIDTH = SCREEN_WIDTH;
  static SCREEN_HEIGHT = SCREEN_HEIGHT;
  private readonly _container: HTMLElement;
  private readonly _bufferCanvas: HTMLCanvasElement;
  private readonly _bufferContext: CanvasRenderingContext2D;
  private readonly _canvas: HTMLCanvasElement;
  private readonly _context: CanvasRenderingContext2D;
  private readonly _fontRenderer: FontRenderer;

  constructor() {
    this._container = <any>document.getElementById('container');
    this._container.innerHTML = '';
    this._bufferCanvas = document.createElement('canvas');
    this._bufferCanvas.width = WIDTH * TILE_WIDTH;
    this._bufferCanvas.height = HEIGHT * TILE_HEIGHT;
    this._bufferContext = <any>this._bufferCanvas.getContext('2d');
    this._bufferContext.imageSmoothingEnabled = false;
    this._fontRenderer = new FontRenderer();
    this._canvas = document.createElement('canvas');
    this._canvas.width = WIDTH * TILE_WIDTH;
    this._canvas.height = HEIGHT * TILE_HEIGHT;
    this._context = <any>this._canvas.getContext('2d');
    this._bufferContext.imageSmoothingEnabled = false;
    this._container.appendChild(this._canvas);
  }

  render(): Promise<any> {
    return this._renderScreen()
      .then(() => this._renderBuffer());
  }

  private _renderScreen(): Promise<any> {
    const { screen } = jwb.state;
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
  }

  private _renderBuffer(): Promise<any> {
    return createImageBitmap(this._bufferContext.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT))
      .then(imageBitmap => this._context.drawImage(imageBitmap, 0, 0));
  }

  private _renderGameScreen(): Promise<any> {
    revealTiles();
    this._bufferContext.fillStyle = Colors.BLACK;
    this._bufferContext.fillRect(0, 0, this._bufferCanvas.width, this._bufferCanvas.height);

    return chainPromises([
      () => this._renderTiles(),
      () => this._renderItems(),
      () => this._renderProjectiles(),
      () => this._renderUnits(),
      () => this._renderHUD()
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
            promises.push(this._drawEllipse({ x, y }, Colors.DARK_GRAY)
              .then(() => this._renderElement(item, { x, y })));
          }
        }
      }
    }
    return Promise.all(promises);
  }

  private _renderProjectiles(): Promise<any> {
    const map = jwb.state.getMap();
    const promises: Promise<any>[] = [];
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (isTileRevealed({ x, y })) {
          const projectile = map.projectiles
            .filter(p => coordinatesEquals(p, { x, y }))[0];
          if (!!projectile) {
            promises.push(this._renderElement(projectile, { x, y }));
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
            let shadowColor;
            if (unit === playerUnit) {
              shadowColor = Colors.GREEN;
            } else {
              shadowColor = Colors.DARK_GRAY;
            }
            promises.push(this._drawEllipse({ x, y }, shadowColor)
              .then(() => this._renderElement(unit, { x, y })));
          }
        }
      }
    }
    return Promise.all(promises);
  }

  /**
   * TODO memoize
   * @param color (in hex form)
   */
  private _drawEllipse({ x, y }: Coordinates, color: Colors): Promise<any> {
    const { x: left, y: top } = this._gridToPixel({ x, y });
    return loadImage(SHADOW_FILENAME)
      .then(imageData => applyTransparentColor(imageData, Colors.WHITE))
      .then(imageData => replaceColors(imageData, { [Colors.BLACK]: color }))
      .then(createImageBitmap)
      .then(imageBitmap => {
        this._bufferContext.drawImage(imageBitmap, left, top)
      });
  }

  private _renderInventory(): Promise<any> {
    const { playerUnit } = jwb.state;
    const { inventory } = playerUnit;
    const { _bufferCanvas, _bufferContext } = this;

    return loadImage(INVENTORY_BACKGROUND_FILENAME)
      .then(createImageBitmap)
      .then(imageBitmap => this._bufferContext.drawImage(imageBitmap, INVENTORY_LEFT, INVENTORY_TOP, INVENTORY_WIDTH, INVENTORY_HEIGHT))
      .then(() => {
        // draw equipment
        const equipmentLeft = INVENTORY_LEFT + INVENTORY_MARGIN;
        const itemsLeft = (_bufferCanvas.width + INVENTORY_MARGIN) / 2;

        const promises: Promise<any>[] = [];
        promises.push(this._drawText('EQUIPMENT', Fonts.PERFECT_DOS_VGA, { x: _bufferCanvas.width / 4, y: INVENTORY_TOP + INVENTORY_MARGIN }, Colors.WHITE, 'center'));
        promises.push(this._drawText('INVENTORY', Fonts.PERFECT_DOS_VGA, { x: _bufferCanvas.width * 3 / 4, y: INVENTORY_TOP + INVENTORY_MARGIN }, Colors.WHITE, 'center'));

        // draw equipment items
        // for now, just display them all in one list

        let y = INVENTORY_TOP + 64;
        playerUnit.equipment.getEntries().forEach(([slot, equipment]) => {
          promises.push(this._drawText(`${slot} - ${equipment.name}`, Fonts.PERFECT_DOS_VGA, { x: equipmentLeft, y }, Colors.WHITE, 'left'));
          y += LINE_HEIGHT;
        });

        // draw inventory categories
        const inventoryCategories: ItemCategory[] = Object.values(ItemCategory);
        const categoryWidth = 60;
        const xOffset = 4;

        for (let i = 0; i < inventoryCategories.length; i++) {
          const x = itemsLeft + i * categoryWidth + (categoryWidth / 2) + xOffset;
          const top = INVENTORY_TOP + 40;
          promises.push(this._drawText(inventoryCategories[i], Fonts.PERFECT_DOS_VGA, { x, y: top }, Colors.WHITE, 'center'));
          if (inventoryCategories[i] === inventory.selectedCategory) {
            _bufferContext.fillStyle = Colors.WHITE;
            _bufferContext.fillRect(x - (categoryWidth / 2) + 4, INVENTORY_TOP + 54, categoryWidth - 8, 1);
          }
        }

        // draw inventory items
        if (inventory.selectedCategory) {
          const items = inventory.get(inventory.selectedCategory);
          const x = itemsLeft + 8;
          for (let i = 0; i < items.length; i++) {
            const y = INVENTORY_TOP + 64 + LINE_HEIGHT * i;
            let color;
            if (items[i] === inventory.selectedItem) {
              color = Colors.YELLOW;
            } else {
              color = Colors.WHITE;
            }
            promises.push(this._drawText(items[i].name, Fonts.PERFECT_DOS_VGA, { x, y }, color, 'left'));
          }
        }

        return Promise.all(promises);
      });
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
      .then(image => this._bufferContext.drawImage(image, x + sprite.dx, y + sprite.dy));
  }

  private _renderHUD(): Promise<any> {
    return this._renderHUDFrame()
      .then(() => Promise.all([
        this._renderHUDLeftPanel(),
        this._renderHUDMiddlePanel(),
        this._renderHUDRightPanel(),
      ]));
  }

  private _renderHUDFrame(): Promise<any> {
    return loadImage(HUD_FILENAME)
      .then(createImageBitmap)
      .then(imageBitmap => this._bufferContext.drawImage(imageBitmap, 0, SCREEN_HEIGHT - HUD_HEIGHT));
  }

  /**
   * Renders the bottom-left area of the screen, showing information about the player
   */
  private _renderHUDLeftPanel(): Promise<any> {
    const { playerUnit } = jwb.state;

    const lines = [
      playerUnit.name,
      `Level ${playerUnit.level}`,
      `Life: ${playerUnit.life}/${playerUnit.maxLife}`,
      `Damage: ${playerUnit.getDamage()}`,
    ];

    const left = HUD_MARGIN;
    const top = SCREEN_HEIGHT - HUD_HEIGHT + HUD_MARGIN;
    const promises: Promise<any>[] = [];
    for (let i = 0; i < lines.length; i++) {
      let y = top + (LINE_HEIGHT * i);
      promises.push(this._drawText(lines[i], Fonts.PERFECT_DOS_VGA, { x: left, y }, Colors.WHITE, 'left'));
    }
    return Promise.all(promises);
  }

  private _renderHUDMiddlePanel(): Promise<any> {
    const { _bufferContext } = this;
    const { messages } = jwb.state;
    _bufferContext.fillStyle = Colors.BLACK;
    _bufferContext.strokeStyle = Colors.WHITE;

    const left = HUD_LEFT_WIDTH + HUD_MARGIN;
    const top = SCREEN_HEIGHT - HUD_HEIGHT + HUD_MARGIN;

    const promises: Promise<any>[] = [];
    for (let i = 0; i < messages.length; i++) {
      let y = top + (LINE_HEIGHT * i);
      promises.push(this._drawText(messages[i], Fonts.PERFECT_DOS_VGA, { x: left, y }, Colors.WHITE, 'left'));
    }
    return Promise.all(promises);
  }

  private _renderHUDRightPanel(): Promise<any> {
    const { mapIndex, playerUnit, turn } = jwb.state;

    const left = SCREEN_WIDTH - HUD_RIGHT_WIDTH + HUD_MARGIN;
    const top = SCREEN_HEIGHT - HUD_HEIGHT + HUD_MARGIN;

    const lines = [
      `Turn: ${turn}`,
      `Floor: ${(mapIndex || 0) + 1}`,
    ];

    const experienceToNextLevel = playerUnit.experienceToNextLevel();
    if (experienceToNextLevel !== null) {
      lines.push(`Experience: ${playerUnit.experience}/${experienceToNextLevel}`);
    }

    const promises: Promise<any>[] = [];
    for (let i = 0; i < lines.length; i++) {
      let y = top + (LINE_HEIGHT * i);
      promises.push(this._drawText(lines[i], Fonts.PERFECT_DOS_VGA, { x: left, y }, Colors.WHITE, 'left'));
    }
    return Promise.all(promises);
  }

  private _drawRect({ left, top, width, height }: Rect) {
    const { _bufferContext } = this;

    _bufferContext.fillStyle = Colors.BLACK;
    _bufferContext.fillRect(left, top, width, height);
    _bufferContext.strokeStyle = Colors.WHITE;
    _bufferContext.strokeRect(left, top, width, height);
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

  private _renderSplashScreen(filename: string, text: string): Promise<any> {
    return loadImage(filename)
      .then(imageData => createImageBitmap(imageData))
      .then(image => this._bufferContext.drawImage(image, 0, 0, this._bufferCanvas.width, this._bufferCanvas.height))
      .then(() => this._drawText(text, Fonts.PERFECT_DOS_VGA, { x: 320, y: 300 }, Colors.WHITE, 'center'));
  }

  private _drawText(text: string, font: FontDefinition, { x, y }: Coordinates, color: Colors, textAlign: 'left' | 'center' | 'right'): Promise<any> {
    return this._fontRenderer.render(text, font, color)
      .then(imageBitmap => {
        let left;
        switch (textAlign) {
          case 'left':
            left = x;
            break;
          case 'center':
            left = Math.floor(x - imageBitmap.width / 2);
            break;
          case 'right':
            left = x + imageBitmap.width;
            break;
          default:
            throw 'fux';
        }
        this._bufferContext.drawImage(imageBitmap, left, y);
        return resolvedPromise();
      });
  }

  private _renderMinimap(): Promise<any> {
    const minimapRenderer = new MinimapRenderer();
    return minimapRenderer.render()
      .then(bitmap => this._bufferContext.drawImage(bitmap, 0, 0));
  }
}

export default SpriteRenderer;
