import SpriteRenderer from './SpriteRenderer';
import Color from '../types/Color';
import { Coordinates } from '../types/types';
import { coordinatesEquals, isTileRevealed } from '../maps/MapUtils';

const LIGHT_GRAY = '#c0c0c0';
const DARK_GRAY  = '#808080';
const BLACK      = '#000000';

class MinimapRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = SpriteRenderer.SCREEN_WIDTH;
    this.canvas.height = SpriteRenderer.SCREEN_HEIGHT;
    this.context = <any>this.canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;
  }

  render = async (): Promise<ImageBitmap> => {
    this.context.fillStyle = Color.BLACK;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const map = jwb.state.getMap();
    const m = Math.floor(Math.min(
      this.canvas.width / map.width,
      this.canvas.height / map.height
    ));
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        this.context.fillStyle = this._getColor({ x, y });
        this.context.fillRect(x * m, y * m, m, m);
      }
    }
    const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    return createImageBitmap(imageData);
  };

  private _getColor = ({ x, y }: Coordinates) => {
    if (coordinatesEquals(jwb.state.playerUnit, { x, y })) {
      return Color.RED;
    }

    const map = jwb.state.getMap();
    if (isTileRevealed({ x, y })) {
      const tileType = map.getTile({ x, y }).type;
      switch (tileType) {
        case 'FLOOR':
        case 'FLOOR_HALL':
        case 'STAIRS_DOWN':
          return LIGHT_GRAY;
        case 'WALL':
        case 'WALL_HALL':
          return DARK_GRAY;
        case 'NONE':
        case 'WALL_TOP':
        default:
          return BLACK;
      }

    } else {
      return BLACK;
    }
  };
}

export default MinimapRenderer;
