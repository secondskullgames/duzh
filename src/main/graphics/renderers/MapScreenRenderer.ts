import GameState from '../../core/GameState';
import Coordinates from '../../geometry/Coordinates';
import Color from '../Color';
import Colors from '../Colors';
import { Renderer } from './Renderer';
import { Graphics } from '../Graphics';

const backgroundColor = Color.fromHex('#404040');

type Props = Readonly<{
  state: GameState,
  graphics: Graphics
}>;

export default class MapScreenRenderer implements Renderer {
  private readonly state: GameState;
  private readonly graphics: Graphics;

  constructor({ state, graphics }: Props) {
    this.state = state;
    this.graphics = graphics;
  }

  /**
   * @override {@link Renderer#render}
   */
  render = async () => {
    const { graphics } = this;
    graphics.fill(backgroundColor);

    const map = this.state.getMap();
    const cellDimension = Math.floor(Math.min(
      graphics.getWidth() / map.width,
      graphics.getHeight() / map.height
    ));

    const left = (graphics.getWidth() - (map.width * cellDimension)) / 2;
    const top = (graphics.getHeight() - (map.height * cellDimension)) / 2;

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const color = this._getColor({ x, y })!;
        const rect = {
          left: x * cellDimension + left,
          top: y * cellDimension + top,
          width: cellDimension,
          height: cellDimension
        };
        graphics.fillRect(rect, color);
      }
    }
  };

  private _getColor = ({ x, y }: Coordinates): Color => {
    const { state } = this;
    const playerUnit = state.getPlayerUnit();
    const map = state.getMap();

    if (Coordinates.equals(playerUnit.getCoordinates(), { x, y })) {
      return Colors.GREEN;
    }

    if (map.isTileRevealed({ x, y })) {
      const tileType = map.getTile({ x, y }).getTileType();
      switch (tileType) {
        case 'STAIRS_DOWN':
          return Colors.BLUE;
        case 'FLOOR':
        case 'FLOOR_HALL':
          const unit = map.getUnit({ x, y });
          if (unit && unit?.getFaction() !== playerUnit.getFaction()) {
            return Colors.RED;
          } else if (map.getItem({ x, y })) {
            return Colors.YELLOW;
          }
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
      return Colors.DARKER_GRAY;
    }
  };
}
