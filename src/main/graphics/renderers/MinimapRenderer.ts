import GameState from '../../core/GameState';
import { isTileRevealed } from '../../maps/MapUtils';
import Color from '../../types/Color';
import Coordinates from '../../types/Coordinates';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import BufferedRenderer from './BufferedRenderer';

const LIGHT_GRAY = '#c0c0c0';
const DARK_GRAY  = '#808080';
const BLACK      = '#000000';

class MinimapRenderer extends BufferedRenderer {
  constructor() {
    super({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, id: 'minimap' });
  }

  renderBuffer = async () => {
    const { bufferCanvas, bufferContext } = this;
    bufferContext.fillStyle = Color.BLACK;
    bufferContext.fillRect(0, 0, bufferCanvas.width, bufferCanvas.height);

    const map = GameState.getInstance().getMap();
    const m = Math.floor(Math.min(
      bufferCanvas.width / map.width,
      bufferCanvas.height / map.height
    ));

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        bufferContext.fillStyle = this._getColor({ x, y });
        bufferContext.fillRect(x * m, y * m, m, m);
      }
    }
    const imageData = bufferContext.getImageData(0, 0, bufferCanvas.width, bufferCanvas.height);
    await createImageBitmap(imageData);
  };

  private _getColor = ({ x, y }: Coordinates) => {
    const state = GameState.getInstance();
    const { playerUnit } = state;
    const map = state.getMap();

    if (Coordinates.equals(playerUnit, { x, y })) {
      return Color.RED;
    }

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
