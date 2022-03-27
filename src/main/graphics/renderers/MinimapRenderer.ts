import GameState from '../../core/GameState';
import { isTileRevealed } from '../../maps/MapUtils';
import Coordinates from '../../geometry/Coordinates';
import Color from '../Color';
import Colors from '../Colors';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import Renderer from './Renderer';

class MinimapRenderer extends Renderer {
  constructor() {
    super({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, id: 'minimap' });
  }

  _redraw = async () => {
    const { canvas, context } = this;
    context.fillStyle = '#404040';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const map = GameState.getInstance().getMap();
    const m = Math.floor(Math.min(
      canvas.width / map.width,
      canvas.height / map.height
    ));

    const left = (canvas.width - (map.width * m)) / 2;
    const top = (canvas.height - (map.height * m)) / 2;

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        context.fillStyle = this._getColor({ x, y }).hex;
        context.fillRect(x * m + left, y * m + top, m, m);
      }
    }
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    await createImageBitmap(imageData);
  };

  private _getColor = ({ x, y }: Coordinates): Color => {
    const state = GameState.getInstance();
    const playerUnit = state.getPlayerUnit();
    const map = state.getMap();

    if (Coordinates.equals(playerUnit, { x, y })) {
      return Colors.GREEN;
    }

    if (isTileRevealed({ x, y })) {
      const tileType = map.getTile({ x, y }).type;
      switch (tileType) {
        case 'STAIRS_DOWN':
          return Colors.BLUE;
        case 'FLOOR':
        case 'FLOOR_HALL':
          return Colors.LIGHT_GRAY;
        case 'WALL':
        case 'WALL_HALL':
          return Colors.DARK_GRAY;
        case 'NONE':
        case 'WALL_TOP':
        default:
          return Colors.BLACK;
      }
    } else {
      return Colors.BLACK;
    }
  };
}

export default MinimapRenderer;
