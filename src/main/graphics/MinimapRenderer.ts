import SpriteRenderer from './SpriteRenderer';
import Color from '../types/Color';
import { Coordinates, TileType } from '../types/types';
import { coordinatesEquals, isTileRevealed } from '../maps/MapUtils';

class MinimapRenderer {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _context: CanvasRenderingContext2D;

  constructor() {
    this._canvas = document.createElement('canvas');
    this._canvas.width = SpriteRenderer.SCREEN_WIDTH;
    this._canvas.height = SpriteRenderer.SCREEN_HEIGHT;
    this._context = <any>this._canvas.getContext('2d');
    this._context.imageSmoothingEnabled = false;
  }

  render(): Promise<ImageBitmap> {
    this._context.fillStyle = Color.BLACK;
    this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);

    const map = jwb.state.getMap();
    const m = Math.floor(Math.min(
      this._canvas.width / map.width,
      this._canvas.height / map.height
    ));
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        this._context.fillStyle = this._getColor({ x, y });
        this._context.fillRect(x * m, y * m, m, m);
      }
    }
    const imageData = this._context.getImageData(0, 0, this._canvas.width, this._canvas.height);
    return createImageBitmap(imageData);
  }

  private _getColor({ x, y }: Coordinates) {
    if (coordinatesEquals(jwb.state.playerUnit, { x, y })) {
      return Color.RED;
    }

    const map = jwb.state.getMap();
    if (isTileRevealed({ x, y })) {
      const tileType = map.getTile({ x, y }).type;
      switch (tileType) {
        case 'FLOOR':
        case 'FLOOR'_HALL:
        case 'STAIRS'_DOWN:
          return Color.LIGHT_GRAY;
        case 'WALL':
        case 'WALL'_HALL:
          return Color.DARK_GRAY;
        case 'NONE':
        case 'WALL'_TOP:
        default:
          return Color.BLACK;
      }

    } else {
      return Color.BLACK;
    }
  }
}

export default MinimapRenderer;
