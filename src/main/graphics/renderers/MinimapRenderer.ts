import GameState from '../../core/GameState';
import { isTileRevealed } from '../../maps/MapUtils';
import { Colors } from '../../types/Color';
import Coordinates from '../../geometry/Coordinates';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import Renderer from './Renderer';

const LIGHT_GRAY = '#c0c0c0';
const DARK_GRAY  = '#808080';
const BLACK      = '#000000';

class MinimapRenderer extends Renderer {
  constructor() {
    super({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, id: 'minimap' });
  }

  _redraw = async () => {
    const { canvas, context } = this;
    context.fillStyle = Colors.BLACK;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const map = GameState.getInstance().getMap();
    const m = Math.floor(Math.min(
      canvas.width / map.width,
      canvas.height / map.height
    ));

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        context.fillStyle = this._getColor({ x, y });
        context.fillRect(x * m, y * m, m, m);
      }
    }
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    await createImageBitmap(imageData);
  };

  private _getColor = ({ x, y }: Coordinates) => {
    const state = GameState.getInstance();
    const playerUnit = state.getPlayerUnit();
    const map = state.getMap();

    if (Coordinates.equals(playerUnit, { x, y })) {
      return Colors.RED;
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
